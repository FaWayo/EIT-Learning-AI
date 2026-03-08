import logging
from datetime import datetime
from typing import List

from fastapi import APIRouter, BackgroundTasks, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from db import SessionLocal, get_session
from ingestion_service import IngestionService
from models import Document, DocumentStatus, IngestionJob, IngestionJobStatus
from storage import save_upload_file
from tasks import ingest_document_task

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/documents",
    tags=["documents"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def _run_ingestion_inline(document_id: str) -> None:
    """Fallback: run ingestion synchronously when Celery/Redis is unavailable."""
    # Phase 1: Mark job/document as running (then close session to avoid SQLite locks)
    job_id = None
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

        job_id = job.id
        job.status = IngestionJobStatus.RUNNING.value
        job.started_at = datetime.utcnow()
        document.status = DocumentStatus.PROCESSING.value

    # Phase 2: Run ingestion (opens its own session internally)
    service = IngestionService()
    try:
        num_chunks = service.ingest_document(document_id=document_id)
    except Exception as exc:
        # Phase 3a: Mark as failed
        with get_session() as session:
            job = session.query(IngestionJob).get(job_id)
            doc = session.query(Document).get(document_id)
            if job:
                job.status = IngestionJobStatus.FAILED.value
                job.error_message = str(exc)
                job.finished_at = datetime.utcnow()
            if doc:
                doc.status = DocumentStatus.FAILED.value
                doc.error_message = str(exc)
        logger.exception("Inline ingestion failed for document %s", document_id)
        return

    # Phase 3b: Mark job as succeeded (document status already set by ingest_document)
    with get_session() as session:
        job = session.query(IngestionJob).get(job_id)
        if job:
            job.status = IngestionJobStatus.SUCCEEDED.value
            job.finished_at = datetime.utcnow()


@router.post(
    "/upload",
    status_code=status.HTTP_202_ACCEPTED,
    summary="Upload one or more documents for async ingestion",
    description=(
        "Accepts one or more files and enqueues background ingestion jobs. "
        "Returns document IDs and initial statuses; use the status endpoint to track progress."
    ),
)
async def upload_documents(
    files: List[UploadFile] = File(...),
    background_tasks: BackgroundTasks = None,
    db: Session = Depends(get_db),
):
    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded")

    created_docs = []
    docs_needing_inline = []

    for upload in files:
        document = Document(
            title=upload.filename,
            original_filename=upload.filename,
            storage_uri="",
            mime_type=upload.content_type or "application/octet-stream",
            content_type="other",
            status=DocumentStatus.QUEUED.value,
        )
        db.add(document)
        db.flush()

        storage_uri, mime_type = save_upload_file(document.id, upload)
        document.storage_uri = storage_uri
        document.mime_type = mime_type
        document.status = DocumentStatus.QUEUED.value

        job = IngestionJob(
            document_id=document.id,
            status=IngestionJobStatus.QUEUED.value,
        )
        db.add(job)
        db.flush()

        try:
            ingest_document_task.delay(document.id)
        except Exception:
            logger.warning(
                "Celery/Redis unavailable, will run ingestion inline for document %s",
                document.id,
            )
            docs_needing_inline.append(document.id)

        created_docs.append(
            {
                "id": document.id,
                "title": document.title,
                "status": document.status,
            }
        )

    db.commit()

    for doc_id in docs_needing_inline:
        background_tasks.add_task(_run_ingestion_inline, doc_id)

    return {"documents": created_docs}


@router.get(
    "",
    summary="List all documents and their ingestion status",
    description="Returns basic metadata and ingestion status for all known documents.",
)
async def list_documents(db: Session = Depends(get_db)):
    documents = db.query(Document).all()
    return [
        {
            "id": d.id,
            "title": d.title,
            "content_type": d.content_type,
            "status": d.status,
            "num_chunks": d.num_chunks,
            "created_at": d.created_at,
            "updated_at": d.updated_at,
        }
        for d in documents
    ]


@router.get(
    "/{document_id}/status",
    summary="Get ingestion status for a single document",
    description="Returns status, number of chunks, and ingestion job history for the given document.",
)
async def document_status(document_id: str, db: Session = Depends(get_db)):
    document = db.query(Document).get(document_id)
    if document is None:
        raise HTTPException(status_code=404, detail="Document not found")

    jobs = (
        db.query(IngestionJob)
        .filter(IngestionJob.document_id == document_id)
        .order_by(IngestionJob.created_at.desc())
        .all()
    )

    return {
        "id": document.id,
        "title": document.title,
        "status": document.status,
        "num_chunks": document.num_chunks,
        "error_message": document.error_message,
        "created_at": document.created_at,
        "updated_at": document.updated_at,
        "jobs": [
            {
                "id": j.id,
                "status": j.status,
                "error_message": j.error_message,
                "created_at": j.created_at,
                "started_at": j.started_at,
                "finished_at": j.finished_at,
            }
            for j in jobs
        ],
    }
