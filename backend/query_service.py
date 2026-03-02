from typing import List, Sequence

from llm_clients import GeminiChatClient, GeminiEmbeddingClient
from models import Chunk
from schemas import Citation, CitationLocation, QueryFilters, QueryResponse
from vectorstore import VectorStore


class QueryService:
    def __init__(
        self,
        embedding_client: GeminiEmbeddingClient | None = None,
        chat_client: GeminiChatClient | None = None,
        vector_store: VectorStore | None = None,
    ) -> None:
        self.embedding_client = embedding_client or GeminiEmbeddingClient()
        self.chat_client = chat_client or GeminiChatClient()
        self.vector_store = vector_store or VectorStore()

    async def answer_query(self, query: str, filters: QueryFilters | None, top_k: int) -> QueryResponse:
        # 1. Embed query
        query_embedding = await self.embedding_client.embed_texts([query])

        # 2. Build Chroma filters
        where: dict = {}
        if filters:
            if filters.document_ids:
                where["document_id"] = {"$in": filters.document_ids}
            if filters.content_types:
                where["content_type"] = {"$in": filters.content_types}

        # 3. Retrieve from Chroma
        results = self.vector_store.query(query_embeddings=query_embedding, n_results=top_k, where=where)
        ids = results.get("ids", [[]])[0]
        metadatas = results.get("metadatas", [[]])[0]
        distances = results.get("distances", [[]])[0]

        if not ids:
            return QueryResponse(answer="I do not have an answer to this question based on the documents I have access to.", citations=[])

        # 4. Build context blocks and citation metadata
        context_blocks: List[str] = []
        citations: List[Citation] = []

        for idx, (meta, dist) in enumerate(zip(metadatas, distances), start=1):
            doc_title = meta.get("document_title", "Unknown document")
            chunk_index = meta.get("chunk_index")
            page_number = meta.get("page_number")
            section_heading = meta.get("section_heading")
            start_time_sec = meta.get("start_time_sec")
            end_time_sec = meta.get("end_time_sec")
            text = meta.get("text", "")

            context_blocks.append(
                f"[{idx}] Document: {doc_title}\n"
                f"Location: "
                f"{'page ' + str(page_number) + ', ' if page_number else ''}"
                f"{'section ' + section_heading + ', ' if section_heading else ''}"
                f"{'chunk ' + str(chunk_index) if chunk_index is not None else ''}\n"
                f"Content:\n{text}"
            )

            loc = CitationLocation(
                page_number=page_number,
                section_heading=section_heading,
                chunk_index=chunk_index,
                start_time_sec=start_time_sec,
                end_time_sec=end_time_sec,
            )
            citations.append(
                Citation(
                    id=idx,
                    document_id=meta.get("document_id", ""),
                    document_title=doc_title,
                    location=loc,
                    snippet=text[:300],
                    similarity_score=float(dist),
                )
            )

        # 5. Call LLM with system instructions
        system_instruction = (
            "You are a retrieval-augmented assistant. You must answer using ONLY the provided sources.\n"
            "Each source is labeled like [1], [2], etc. When you make a factual statement, include the "
            "corresponding citation labels (e.g., [1][2]). If the sources do not contain enough information "
            "to answer, say: 'I do not have an answer to this question based on the provided documents.'"
        )

        answer_text = await self.chat_client.generate_answer(
            system_instruction=system_instruction,
            context_blocks=context_blocks,
            user_question=query,
        )

        if not answer_text.strip():
            answer_text = "I do not have an answer to this question based on the documents I have access to."

        return QueryResponse(answer=answer_text, citations=citations)

