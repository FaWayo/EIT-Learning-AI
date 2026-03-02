from celery import Celery
 
from config import get_settings
 
 
def create_celery_app() -> Celery:
    settings = get_settings()
    app = Celery(
        "rag_backend",
        broker=settings.celery_broker_url,
        backend=settings.celery_result_backend,
    )
    app.conf.update(
        task_acks_late=True,
        worker_prefetch_multiplier=1,
    )
    return app
 
 
celery_app = create_celery_app()
 
