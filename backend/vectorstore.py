from typing import List, Sequence

import chromadb
from chromadb.api.models.Collection import Collection

from config import get_settings


class VectorStore:
    def __init__(self) -> None:
        settings = get_settings()
        self._client = chromadb.PersistentClient(path=settings.chroma_db_dir)
        self._collection: Collection = self._client.get_or_create_collection(
            name=settings.chroma_collection_name
        )

    @property
    def collection(self) -> Collection:
        return self._collection

    def add_embeddings(
        self,
        ids: Sequence[str],
        embeddings: Sequence[Sequence[float]],
        metadatas: Sequence[dict],
    ) -> None:
        self._collection.add(ids=list(ids), embeddings=list(embeddings), metadatas=list(metadatas))

    def query(
        self,
        query_embeddings: Sequence[Sequence[float]],
        n_results: int,
        where: dict | None = None,
    ) -> dict:
        """
        Wrapper around Chroma query.
        """
        kwargs: dict = {
            "query_embeddings": list(query_embeddings),
            "n_results": n_results,
            "include": ["distances", "metadatas"],
        }
        if where:
            kwargs["where"] = where
        return self._collection.query(**kwargs)

