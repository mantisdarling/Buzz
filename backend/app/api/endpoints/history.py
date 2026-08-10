"""
History router.

GET  /history          — paginated list of the current user's submissions
GET  /history/{id}     — single submission detail (must belong to current user)
POST /history/{id}/feedback — submit thumbs-up/thumbs-down on a verdict
"""
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlmodel import Session, select

from app.core.security import TokenData, get_current_user
from app.db.session import get_db
from app.models.feedback import Feedback
from app.models.submission import Submission

router = APIRouter()


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------
class FeedbackRequest(BaseModel):
    verdict_correct: bool  # True = thumbs up, False = thumbs down


class SubmissionOut(BaseModel):
    id: int
    input_type: str
    raw_url: Optional[str]
    text_content: Optional[str]
    verdict: Optional[str]
    confidence: Optional[float]
    scores: Optional[dict]
    explanation: Optional[list]
    status: str
    created_at: str


class HistoryPage(BaseModel):
    items: list[SubmissionOut]
    total: int
    page: int
    page_size: int


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------
@router.get("/history", response_model=HistoryPage)
async def get_history(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user),
) -> HistoryPage:
    offset = (page - 1) * page_size
    query = (
        select(Submission)
        .where(Submission.user_id == current_user.user_id)
        .order_by(Submission.created_at.desc())  # type: ignore
    )
    total = len(db.exec(query).all())
    items = db.exec(query.offset(offset).limit(page_size)).all()

    return HistoryPage(
        items=[
            SubmissionOut(
                id=s.id,
                input_type=s.input_type,
                raw_url=s.raw_url,
                text_content=s.text_content,
                verdict=s.verdict,
                confidence=s.confidence,
                scores={
                    "baseline": s.baseline_score,
                    "style": s.style_score,
                    "distilbert": s.distilbert_score,
                },
                explanation=s.explanation,
                status=s.status,
                created_at=s.created_at.isoformat(),
            )
            for s in items
        ],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/history/{submission_id}", response_model=SubmissionOut)
async def get_submission(
    submission_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user),
) -> SubmissionOut:
    sub = db.get(Submission, submission_id)
    if not sub or sub.user_id != current_user.user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Submission not found.")
    return SubmissionOut(
        id=sub.id,
        input_type=sub.input_type,
        raw_url=sub.raw_url,
        text_content=sub.text_content,
        verdict=sub.verdict,
        confidence=sub.confidence,
        scores={
            "baseline": sub.baseline_score,
            "style": sub.style_score,
            "distilbert": sub.distilbert_score,
        },
        explanation=sub.explanation,
        status=sub.status,
        created_at=sub.created_at.isoformat(),
    )


@router.post("/history/{submission_id}/feedback", status_code=status.HTTP_201_CREATED)
async def submit_feedback(
    submission_id: int,
    body: FeedbackRequest,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user),
) -> dict:
    sub = db.get(Submission, submission_id)
    if not sub or sub.user_id != current_user.user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Submission not found.")

    # Allow re-submission (overwrite existing feedback)
    existing = db.exec(
        select(Feedback)
        .where(Feedback.submission_id == submission_id)
        .where(Feedback.user_id == current_user.user_id)
    ).first()

    if existing:
        existing.verdict_correct = body.verdict_correct
        db.add(existing)
    else:
        db.add(
            Feedback(
                submission_id=submission_id,
                user_id=current_user.user_id,
                verdict_correct=body.verdict_correct,
            )
        )
    db.commit()
    return {"message": "Feedback recorded."}
