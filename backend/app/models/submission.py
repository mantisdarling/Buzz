"""
Submission model.

Stores the raw input (text or URL), all per-model scores,
the weighted ensemble verdict, and the SHAP explanation payload
(stored as JSON: list of {text, score} dicts for frontend rendering).

The schema includes a nullable 'propagation_signal' JSON column
reserved for a future social-graph feature without requiring a migration.
"""
from datetime import datetime, timezone
from typing import Optional
from sqlmodel import Field, SQLModel, Column
from sqlalchemy import JSON, Text


class Submission(SQLModel, table=True):
    __tablename__ = "submissions"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: Optional[int] = Field(default=None, foreign_key="users.id", index=True)

    # Input
    input_type: str = Field(max_length=4)  # 'text' | 'url'
    raw_url: Optional[str] = Field(default=None, max_length=2048)
    text_content: Optional[str] = Field(default=None, sa_column=Column(Text))

    # Hashed representation used as Redis cache key
    content_hash: Optional[str] = Field(default=None, max_length=64, index=True)

    # Model outputs
    verdict: Optional[str] = Field(default=None, max_length=8)   # 'Real' | 'Fake'
    confidence: Optional[float] = Field(default=None)            # 0.0 – 1.0
    baseline_score: Optional[float] = Field(default=None)
    style_score: Optional[float] = Field(default=None)
    distilbert_score: Optional[float] = Field(default=None)

    # Explainability tokens (JSON list of {text, score})
    explanation: Optional[list] = Field(default=None, sa_column=Column(JSON))

    # Status for async URL jobs
    status: str = Field(default="pending", max_length=16)  # 'pending' | 'done' | 'error'

    # Reserved for v2 social-propagation signal
    propagation_signal: Optional[dict] = Field(default=None, sa_column=Column(JSON))

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
