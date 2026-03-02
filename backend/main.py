from fastapi import FastAPI

from config import get_settings
from db import Base, engine
from routers_documents import router as documents_router
from routers_query import router as query_router


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title=settings.app_name,
        version="0.1.0",
        description="Async multimodal RAG backend with async ingestion and Gemini-powered query.",
    )

    # Ensure tables are created (for development); in production, prefer migrations.
    Base.metadata.create_all(bind=engine)

    app.include_router(documents_router)
    app.include_router(query_router)

    @app.get("/health", tags=["system"], summary="Health check")
    async def health_check() -> dict:
        """Simple health check endpoint used by infra and monitoring."""
        return {"status": "ok"}

    return app


app = create_app()
 
