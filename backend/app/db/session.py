from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlmodel import SQLModel
from app.core.config import get_settings
from typing import Generator

settings = get_settings()

engine_kwargs = {
    "pool_pre_ping": True,
    "echo": (settings.ENVIRONMENT == "development"),
}
if "sqlite" in settings.DATABASE_URL:
    from sqlalchemy.pool import StaticPool
    engine_kwargs.update({
        "connect_args": {"check_same_thread": False},
        "poolclass": StaticPool,
    })
else:
    engine_kwargs.update({
        "pool_size": 10,
        "max_overflow": 20,
    })

engine = create_engine(
    settings.DATABASE_URL,
    **engine_kwargs
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    class_=Session,
)


def create_db_and_tables() -> None:
    """Create all tables defined by SQLModel metadata. Called at startup."""
    SQLModel.metadata.create_all(engine)


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency that yields a database session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
