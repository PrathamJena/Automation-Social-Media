from celery import Celery
from app.core.config import get_settings

settings = get_settings()

celery_app = Celery(
    "aksidhi",
    broker=settings.REDIS_CELERY_BROKER_URL,
    backend=settings.REDIS_CELERY_RESULT_BACKEND,
)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=300,
    worker_max_tasks_per_child=1000,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
    task_reject_on_worker_lost=True,
    task_default_retry_delay=60,
    task_max_retries=3,
    beat_schedule={
        "check-scheduled-posts": {
            "task": "app.workers.scheduler.check_scheduled_posts",
            "schedule": 30.0,
        },
    },
)
