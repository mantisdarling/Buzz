"""
Predict router.

Handles text and URL submissions. Pipeline:
1. Validate + sanitise input
2. Check Redis for cached result (content hash)
3. For URL: dispatch Celery scraping task, return job ID immediately
4. For text: run ensemble inference inline, store result, cache it
5. Return verdict + confidence + scores + explanation tokens

Rate limited: 10 requests/minute per authenticated user (by user_id).
"""
import hashlib
import html
import json
import re
import sys
import os
from typing import Optional

import redis as redis_lib
from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, field_validator
from sqlmodel import Session

from app.core.config import get_settings
from app.core.security import TokenData, get_current_user
from app.db.session import get_db
from app.models.submission import Submission
from app.core.limiter import limiter
from app.tasks.worker import scrape_and_predict

settings = get_settings()
router = APIRouter()

# Redis client (used for caching identical submissions)
_redis = redis_lib.from_url(settings.REDIS_URL, decode_responses=True)

# Lazily loaded ML ensemble (loaded once per worker process)
_ensemble = None

def get_ensemble():
    global _ensemble
    if _ensemble is None:
        # Add the ml directory to the path so we can import the ensemble
        ml_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../../ml"))
        if ml_path not in sys.path:
            sys.path.insert(0, ml_path)
        from ensemble import TruthLensEnsemble
        _ensemble = TruthLensEnsemble()
    return _ensemble

_URL_PATTERN = re.compile(
    r"^https?://"
    r"(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|"
    r"localhost|\d{1,3}(?:\.\d{1,3}){3})"
    r"(?::\d+)?"
    r"(?:/?|[/?]\S+)$",
    re.IGNORECASE,
)

def _sanitise_text(text: str) -> str:
    """Strip dangerous characters and normalise whitespace."""
    # Remove null bytes
    text = text.replace("\x00", "")
    # Normalise whitespace
    text = re.sub(r"\s+", " ", text).strip()
    return text


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------
class PredictRequest(BaseModel):
    text: Optional[str] = None
    url: Optional[str] = None

    @field_validator("text")
    @classmethod
    def validate_text(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = _sanitise_text(v)
        if len(v) < 20:
            raise ValueError("Text must be at least 20 characters.")
        if len(v) > settings.MAX_TEXT_LENGTH:
            raise ValueError(f"Text exceeds maximum length of {settings.MAX_TEXT_LENGTH} characters.")
        return v

    @field_validator("url")
    @classmethod
    def validate_url(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = v.strip()
        if not _URL_PATTERN.match(v):
            raise ValueError("Invalid URL format.")
        return v

    def model_post_init(self, __context) -> None:
        if not self.text and not self.url:
            raise ValueError("Either 'text' or 'url' must be provided.")
        if self.text and self.url:
            raise ValueError("Provide either 'text' or 'url', not both.")


class PredictResponse(BaseModel):
    submission_id: int
    status: str
    verdict: Optional[str] = None
    confidence: Optional[float] = None
    scores: Optional[dict] = None
    explanation: Optional[list] = None
    cached: bool = False


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _compute_hash(text: str) -> str:
    return hashlib.sha256(text.encode()).hexdigest()


def _cache_get(key: str) -> Optional[dict]:
    try:
        val = _redis.get(f"pred:{key}")
        if val:
            return json.loads(val)
    except Exception:
        pass
    return None


def _cache_set(key: str, data: dict, ttl: int = 3600) -> None:
    try:
        _redis.set(f"pred:{key}", json.dumps(data), ex=ttl)
    except Exception:
        pass


# ---------------------------------------------------------------------------
# Endpoint
# ---------------------------------------------------------------------------
@router.post("/predict", response_model=PredictResponse, status_code=status.HTTP_202_ACCEPTED)
@limiter.limit("10/minute")
async def predict(
    request: Request,
    body: PredictRequest,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user),
) -> PredictResponse:

    # ------------------------------------------------------------------
    # URL path: dispatch Celery task, return immediately
    # ------------------------------------------------------------------
    if body.url:
        submission = Submission(
            user_id=current_user.user_id,
            input_type="url",
            raw_url=body.url,
            status="pending",
        )
        db.add(submission)
        db.commit()
        db.refresh(submission)

        # Dispatch background scrape + predict task
        scrape_and_predict.delay(submission.id, body.url)

        return PredictResponse(
            submission_id=submission.id,
            status="pending",
        )

    # ------------------------------------------------------------------
    # Text path: run inline inference
    # ------------------------------------------------------------------
    text = body.text  # already sanitised by validator
    content_hash = _compute_hash(text)

    # Check Redis cache
    cached = _cache_get(content_hash)
    if cached:
        # Persist a submission record linked to this user
        submission = Submission(
            user_id=current_user.user_id,
            input_type="text",
            text_content=text[:500],  # store truncated preview only
            content_hash=content_hash,
            verdict=cached["verdict"],
            confidence=cached["confidence"],
            baseline_score=cached["scores"].get("baseline"),
            style_score=cached["scores"].get("style"),
            distilbert_score=cached["scores"].get("distilbert"),
            explanation=cached["explanation"],
            status="done",
        )
        db.add(submission)
        db.commit()
        db.refresh(submission)

        return PredictResponse(
            submission_id=submission.id,
            status="done",
            verdict=cached["verdict"],
            confidence=cached["confidence"],
            scores=cached["scores"],
            explanation=cached["explanation"],
            cached=True,
        )

    # Run ensemble inference
    ensemble = get_ensemble()
    result = ensemble.predict(text)

    # Persist result
    submission = Submission(
        user_id=current_user.user_id,
        input_type="text",
        text_content=text[:500],
        content_hash=content_hash,
        verdict=result["verdict"],
        confidence=result["confidence"],
        baseline_score=result["scores"].get("baseline"),
        style_score=result["scores"].get("style"),
        distilbert_score=result["scores"].get("distilbert"),
        explanation=result["explanation"],
        status="done",
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)

    # Cache the result for 1 hour
    _cache_set(content_hash, result)

    return PredictResponse(
        submission_id=submission.id,
        status="done",
        verdict=result["verdict"],
        confidence=result["confidence"],
        scores=result["scores"],
        explanation=result["explanation"],
        cached=False,
    )
