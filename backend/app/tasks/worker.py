"""
Celery background tasks.

scrape_and_predict — scrapes a URL using trafilatura, runs ensemble inference,
and updates the Submission record in the database.
"""
import hashlib
import json
import logging
import os
import sys

import trafilatura
from app.tasks.celery_app import celery_app

logger = logging.getLogger(__name__)

# ML ensemble (loaded once per Celery worker process)
_ensemble = None


def _get_ensemble():
    global _ensemble
    if _ensemble is None:
        ml_path = os.path.abspath(
            os.path.join(os.path.dirname(__file__), "../../../../ml")
        )
        if ml_path not in sys.path:
            sys.path.insert(0, ml_path)
        from ensemble import TruthLensEnsemble
        _ensemble = TruthLensEnsemble()
    return _ensemble


@celery_app.task(
    bind=True,
    max_retries=2,
    default_retry_delay=10,
    name="tasks.scrape_and_predict",
)
def scrape_and_predict(self, submission_id: int, url: str) -> dict:
    """
    Scrape *url*, run the ensemble, persist result to the database.
    Retries up to 2 times on transient network failures.
    """
    # Import DB components inside the task to avoid import-time connection issues
    from sqlmodel import Session
    from app.db.session import engine
    from app.models.submission import Submission

    try:
        # Scrape the article text
        downloaded = trafilatura.fetch_url(url)
        text = trafilatura.extract(downloaded, include_comments=False, include_tables=False)

        if not text or len(text.strip()) < 50:
            with Session(engine) as db:
                sub = db.get(Submission, submission_id)
                if sub:
                    sub.status = "error"
                    db.add(sub)
                    db.commit()
            return {"error": "Could not extract readable text from URL"}

        # Run inference
        ensemble = _get_ensemble()
        result = ensemble.predict(text)

        # Persist
        content_hash = hashlib.sha256(text.encode()).hexdigest()
        with Session(engine) as db:
            sub = db.get(Submission, submission_id)
            if sub:
                sub.text_content = text[:500]
                sub.content_hash = content_hash
                sub.verdict = result["verdict"]
                sub.confidence = result["confidence"]
                sub.baseline_score = result["scores"].get("baseline")
                sub.style_score = result["scores"].get("style")
                sub.distilbert_score = result["scores"].get("distilbert")
                sub.explanation = result["explanation"]
                sub.status = "done"
                db.add(sub)
                db.commit()

        return result

    except Exception as exc:
        logger.exception("scrape_and_predict failed for submission %s", submission_id)
        try:
            self.retry(exc=exc)
        except self.MaxRetriesExceededError:
            from sqlmodel import Session
            from app.db.session import engine
            from app.models.submission import Submission
            with Session(engine) as db:
                sub = db.get(Submission, submission_id)
                if sub:
                    sub.status = "error"
                    db.add(sub)
                    db.commit()
        return {"error": str(exc)}
