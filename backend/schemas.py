from typing import List, Optional

from pydantic import BaseModel, Field


class QueryFilters(BaseModel):
    document_ids: Optional[List[str]] = Field(default=None)
    content_types: Optional[List[str]] = Field(default=None)


class QueryRequest(BaseModel):
    query: str
    top_k: int = Field(default=5, ge=1, le=50)
    filters: Optional[QueryFilters] = None


class CitationLocation(BaseModel):
    page_number: Optional[int] = None
    section_heading: Optional[str] = None
    chunk_index: Optional[int] = None
    start_time_sec: Optional[float] = None
    end_time_sec: Optional[float] = None


class Citation(BaseModel):
    id: int
    document_id: str
    document_title: str
    location: CitationLocation
    snippet: str
    similarity_score: float


class QueryResponse(BaseModel):
    answer: str
    citations: List[Citation]

