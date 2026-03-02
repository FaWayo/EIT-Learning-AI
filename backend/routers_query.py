from fastapi import APIRouter

from query_service import QueryService
from schemas import QueryRequest, QueryResponse


router = APIRouter(
    prefix="/query",
    tags=["query"],
)


@router.post(
    "",
    response_model=QueryResponse,
    summary="Query documents using semantic search + Gemini",
    description=(
        "Embeds the query with Gemini, retrieves the most relevant chunks from all ingested documents, "
        "and asks Gemini to answer using only those chunks. Returns the answer plus detailed citations."
    ),
)
async def query_documents(payload: QueryRequest) -> QueryResponse:
    service = QueryService()
    return await service.answer_query(
        query=payload.query,
        filters=payload.filters,
        top_k=payload.top_k,
    )

