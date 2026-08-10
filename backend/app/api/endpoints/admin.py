"""
Admin router — requires 'admin' role JWT.

GET /admin/stats  — aggregate platform statistics:
    - total submissions / unique users / feedback counts
    - daily submission volume (last 30 days)
    - accuracy estimate from feedback
    - top flagged source domains
"""
from datetime import datetime, timedelta, timezone
from collections import Counter
from urllib.parse import urlparse

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlmodel import Session, select, func

from app.core.security import TokenData, require_admin
from app.db.session import get_db
from app.models.feedback import Feedback
from app.models.submission import Submission
from app.models.user import User

router = APIRouter()


class DailyVolume(BaseModel):
    date: str
    count: int


class TopDomain(BaseModel):
    domain: str
    count: int


class StatsResponse(BaseModel):
    total_submissions: int
    total_users: int
    total_feedback: int
    positive_feedback_pct: float
    daily_volume: list[DailyVolume]
    top_flagged_domains: list[TopDomain]


@router.get("/stats", response_model=StatsResponse)
async def get_stats(
    db: Session = Depends(get_db),
    _admin: TokenData = Depends(require_admin),
) -> StatsResponse:
    total_submissions = db.exec(select(func.count(Submission.id))).one()
    total_users = db.exec(select(func.count(User.id))).one()
    total_feedback = db.exec(select(func.count(Feedback.id))).one()

    positive = db.exec(
        select(func.count(Feedback.id)).where(Feedback.verdict_correct == True)  # noqa: E712
    ).one()
    positive_pct = (positive / total_feedback * 100) if total_feedback > 0 else 0.0

    # Daily submission volume last 30 days
    since = datetime.now(timezone.utc) - timedelta(days=30)
    recent = db.exec(
        select(Submission).where(Submission.created_at >= since)
    ).all()

    day_counts: Counter = Counter()
    for sub in recent:
        day_counts[sub.created_at.date().isoformat()] += 1

    daily_volume = [
        DailyVolume(date=d, count=c)
        for d, c in sorted(day_counts.items())
    ]

    # Top flagged domains from URL submissions
    url_subs = db.exec(
        select(Submission).where(
            Submission.input_type == "url",
            Submission.verdict == "Fake",
        )
    ).all()

    domain_counts: Counter = Counter()
    for sub in url_subs:
        if sub.raw_url:
            try:
                domain = urlparse(sub.raw_url).netloc
                if domain:
                    domain_counts[domain] += 1
            except Exception:
                pass

    top_domains = [
        TopDomain(domain=d, count=c)
        for d, c in domain_counts.most_common(10)
    ]

    return StatsResponse(
        total_submissions=total_submissions,
        total_users=total_users,
        total_feedback=total_feedback,
        positive_feedback_pct=round(positive_pct, 2),
        daily_volume=daily_volume,
        top_flagged_domains=top_domains,
    )
