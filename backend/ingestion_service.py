from datetime import datetime
from typing import List

from sqlalchemy.orm import Session

from chunking import ChunkingService
from db import get_session
from llm_clients import GeminiEmbeddingClient
from models import Chunk as ChunkModel
from models import Document, DocumentStatus
from parsing import ParsingPipeline
from vectorstore import VectorStore


class IngestionService:
    def __init__(
        self,
        parsing_pipeline: ParsingPipeline | None = None,
        chunker: ChunkingService | None = None,
        vector_store: VectorStore | None = None,
        embedding_client: GeminiEmbeddingClient | None = None,
    ) -> None:
        self.parsing_pipeline = parsing_pipeline or ParsingPipeline()
        self.chunker = chunker or ChunkingService()
        self.vector_store = vector_store or VectorStore()
        self.embedding_client = embedding_client or GeminiEmbeddingClient()

    def ingest_document(self, document_id: str) -> int:
        """
        Synchronous ingestion logic run inside a Celery worker.
        Returns the number of chunks created.
        """
        with get_session() as session:
            document = session.query(Document).get(document_id)
            if document is None:
                return 0

            segments = self.parsing_pipeline.parse(document)
            chunk_defs = self.chunker.chunk(segments)

            texts = [c.text for c in chunk_defs]
            # We call the async embedding client via a small sync helper.
            embeddings = _embed_sync(self.embedding_client, texts)

            chunk_models: List[ChunkModel] = []
            ids: List[str] = []
            vectors: List[list[float]] = []
            metadatas: List[dict] = []

            for c_def, emb in zip(chunk_defs, embeddings):
                chunk = ChunkModel(
                    document_id=document.id,
                    chunk_index=c_def.chunk_index,
                    text=c_def.text,
                    embedding_id=f"{document.id}:{c_def.chunk_index}",
                    page_number=c_def.page_number,
                    section_heading=c_def.section_heading,
                    start_char=c_def.start_char,
                    end_char=c_def.end_char,
                    start_time_sec=c_def.start_time_sec,
                    end_time_sec=c_def.end_time_sec,
                    created_at=datetime.utcnow(),
                )
                session.add(chunk)
                chunk_models.append(chunk)
                ids.append(chunk.embedding_id)
                vectors.append(emb)
                meta = {
                    "document_id": document.id,
                    "document_title": document.title,
                    "content_type": document.content_type,
                    "chunk_index": c_def.chunk_index,
                    "text": c_def.text,
                }
                if c_def.page_number is not None:
                    meta["page_number"] = c_def.page_number
                if c_def.section_heading is not None:
                    meta["section_heading"] = c_def.section_heading
                if c_def.start_time_sec is not None:
                    meta["start_time_sec"] = c_def.start_time_sec
                if c_def.end_time_sec is not None:
                    meta["end_time_sec"] = c_def.end_time_sec
                metadatas.append(meta)

            # Persist vectors to Chroma
            if ids:
                self.vector_store.add_embeddings(ids=ids, embeddings=vectors, metadatas=metadatas)

            document.status = DocumentStatus.PROCESSED.value
            document.num_chunks = len(chunk_models)
            document.updated_at = datetime.utcnow()

            return len(chunk_models)


def _embed_sync(client: GeminiEmbeddingClient, texts: list[str]) -> list[list[float]]:
    """
    Helper to use the async embedding client from sync Celery workers.
    """
    import anyio

    async def _run() -> list[list[float]]:
        return await client.embed_texts(texts)

    return anyio.run(_run)

