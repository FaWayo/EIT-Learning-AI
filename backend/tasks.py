from datetime import datetime

from celery_app import celery_app
from db import get_session
from ingestion_service import IngestionService
from models import Document, DocumentStatus, IngestionJob, IngestionJobStatus


@celery_app.task(name="ingest_document")
def ingest_document_task(document_id: str) -> None:
    """
    Entry point for background ingestion: parsing -> chunking -> embeddings -> vector store.
    """
    with get_session() as session:
        job = (
            session.query(IngestionJob)
            .filter(IngestionJob.document_id == document_id)
            .order_by(IngestionJob.created_at.desc())
            .first()
        )
        document = session.query(Document).get(document_id)

        if job is None or document is None:
            return

        job.status = IngestionJobStatus.RUNNING.value
        job.started_at = datetime.utcnow()
        document.status = DocumentStatus.PROCESSING.value
        session.flush()

        service = IngestionService()

        try:
            num_chunks = service.ingest_document(document_id=document.id)
            document.status = DocumentStatus.PROCESSED.value
            document.num_chunks = num_chunks
            job.status = IngestionJobStatus.SUCCEEDED.value
            job.finished_at = datetime.utcnow()
        except Exception as exc:  # pragma: no cover - placeholder error handling
            job.status = IngestionJobStatus.FAILED.value
            job.error_message = str(exc)
            job.finished_at = datetime.utcnow()
            document.status = DocumentStatus.FAILED.value
            document.error_message = str(exc)
            raise

