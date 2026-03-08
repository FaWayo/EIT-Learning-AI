from functools import lru_cache
from pydantic import Field
from pydantic_settings import BaseSettings
 
 
class Settings(BaseSettings):
     # Core
     app_name: str = "EIT Learning Assistant Backend"
     debug: bool = False
 
    # Database
     sqlite_db_path: str = "rag_backend.db"
 
    # File storage
     storage_dir: str = "storage"

     # Vector store (Chroma)
     chroma_db_dir: str = "chroma_data"
     chroma_collection_name: str = "document_chunks"
 
     # Task queue (Celery)
     celery_broker_url: str = "redis://localhost:6379/0"
     celery_result_backend: str = "redis://localhost:6379/1"
 
     # Gemini / Google GenAI
     gemini_api_key: str = Field(..., env="GEMINI_API_KEY")
     gemini_embeddings_model: str = "models/gemini-embedding-001"
     gemini_chat_model: str = "gemini-3-flash-preview"
 
     class Config:
         env_file = ".env"
         env_file_encoding = "utf-8"
 
 
@lru_cache()
def get_settings() -> Settings:
     return Settings()
 
