"""
User model.

Roles: 'user' (default) | 'admin'
Passwords are stored as bcrypt hashes — the plain text password is NEVER persisted.
"""
from datetime import datetime, timezone
from typing import Optional
from sqlmodel import Field, SQLModel


class User(SQLModel, table=True):
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True, max_length=254)
    username: str = Field(unique=True, index=True, max_length=64)
    hashed_password: str = Field(min_length=1)
    role: str = Field(default="user", max_length=16)  # 'user' | 'admin'
    is_active: bool = Field(default=True)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    # ------------------------------------------------------------------
    # NOTE: Propagation signal metadata reserved for future use (v2).
    # A 'social_profile_url' or external user ID could live here once
    # Twitter/X access is available, enabling social-graph features
    # without a breaking schema migration.
    # social_profile_url: Optional[str] = None
    # ------------------------------------------------------------------
