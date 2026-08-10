"""
Feedback model.

Stores user verdicts on whether a TruthLens result was correct.
verdict_correct: True (thumbs up) | False (thumbs down)
"""
from datetime import datetime, timezone
from typing import Optional
from sqlmodel import Field, SQLModel


class Feedback(SQLModel, table=True):
    __tablename__ = "feedback"

    id: Optional[int] = Field(default=None, primary_key=True)
    submission_id: int = Field(foreign_key="submissions.id", index=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    verdict_correct: bool  # True = thumbs up, False = thumbs down
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
