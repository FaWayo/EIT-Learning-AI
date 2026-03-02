import uuid
from datetime import datetime
 
from sqlalchemy import JSON, Column, DateTime, Enum, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
 
from db import Base
 
 
class DocumentStatus(str, Enum):
    QUEUED = "queued"
    PROCESSING = "processing"
    PROCESSED = "processed"
    FAILED = "failed"
 
 
class Document(Base):
    __tablename__ = "documents"
 
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    original_filename = Column(String, nullable=False)
    storage_uri = Column(String, nullable=False)
    mime_type = Column(String, nullable=False)
    content_type = Column(String, nullable=False)  # text, pdf, image, audio, video, other
    status = Column(String, nullable=False, default=DocumentStatus.QUEUED)
    error_message = Column(Text, nullable=True)
    num_chunks = Column(Integer, nullable=True)
    extra_metadata = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
 
    chunks = relationship("Chunk", back_populates="document", cascade="all, delete-orphan")
 
 
class Chunk(Base):
    __tablename__ = "chunks"
 
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = Column(String, ForeignKey("documents.id"), nullable=False, index=True)
    chunk_index = Column(Integer, nullable=False)
    text = Column(Text, nullable=False)
    embedding_id = Column(String, nullable=False, unique=True)
 
    page_number = Column(Integer, nullable=True)
    section_heading = Column(String, nullable=True)
    start_char = Column(Integer, nullable=True)
    end_char = Column(Integer, nullable=True)
    start_time_sec = Column(Float, nullable=True)
    end_time_sec = Column(Float, nullable=True)
 
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
 
    document = relationship("Document", back_populates="chunks")
 
 
class IngestionJobStatus(str, Enum):
    QUEUED = "queued"
    RUNNING = "running"
    SUCCEEDED = "succeeded"
    FAILED = "failed"
 
 
class IngestionJob(Base):
    __tablename__ = "ingestion_jobs"
 
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = Column(String, ForeignKey("documents.id"), nullable=False, index=True)
    status = Column(String, nullable=False, default=IngestionJobStatus.QUEUED)
    worker_id = Column(String, nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    started_at = Column(DateTime, nullable=True)
    finished_at = Column(DateTime, nullable=True)
 
