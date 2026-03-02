from typing import List
 
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session
 
from db import SessionLocal
from models import Document, DocumentStatus, IngestionJob, IngestionJobStatus
from storage import save_upload_file
from tasks import ingest_document_task
 
 
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
     db: Session = Depends(get_db),
 ):
     if not files:
         raise HTTPException(status_code=400, detail="No files uploaded")
 
     created_docs = []
 
     for upload in files:
         document = Document(
             title=upload.filename,
             original_filename=upload.filename,
             storage_uri="",
             mime_type=upload.content_type or "application/octet-stream",
             content_type="other",  # refined later based on parsing
             status=DocumentStatus.QUEUED.value,
         )
         db.add(document)
         db.flush()  # assign ID
 
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
 
         ingest_document_task.delay(document.id)
 
         created_docs.append(
             {
                 "id": document.id,
                 "title": document.title,
                 "status": document.status,
             }
         )
 
     db.commit()
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
 
