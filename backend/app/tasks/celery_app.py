"""
Celery application factory.
"""
from celery import Celery
from app.core.config import get_settings

settings = get_settings()

celery_app = Celery(
    "truthlens",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=["app.tasks.worker"],
)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True,
    # Expire task results after 1 hour (same as Redis cache TTL)
    result_expires=3600,
    worker_max_tasks_per_child=200,  # recycle worker after 200 tasks to avoid memory leaks
)
