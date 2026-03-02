 # RAG Backend
 
 Async multimodal Retrieval-Augmented Generation backend built with FastAPI, SQLite for metadata, ChromaDB for vector storage, and Gemini for embeddings and LLM responses.
 
## High-level features
 
 - Async document ingestion via background workers (task queue)
 - Multimodal document support (text, PDFs, images, audio/video via text extraction)
 - Chunking with overlap for retrieval-friendly segments
 - Gemini-based embeddings for chunks and queries
 - ChromaDB vector store for similarity search across all documents
 - SQLite metadata store for documents, chunks, and ingestion jobs
 - Query endpoint that returns answers with detailed citations

## Running the backend

### Prerequisites

- Python 3.10+
- Redis running locally (for Celery)
- A valid Gemini API key (`GEMINI_API_KEY`)

### Setup

```bash
cd backend
python -m venv .venv  # or python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Create a `.env` file in `backend/`:

```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

### Start API and workers

```bash
# Terminal 1: FastAPI app
cd backend
source .venv/bin/activate
uvicorn main:app --reload

# Terminal 2: Celery worker
cd backend
source .venv/bin/activate
celery -A celery_app.celery_app worker --loglevel=info
```

FastAPI will expose OpenAPI/Swagger docs at:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

Your frontend developer can explore and test all endpoints directly from Swagger UI.

## API overview

### Health

- **GET** `/health`
  - **Description**: Simple health check for monitoring.
  - **Response**:
    - `200 OK` – `{"status": "ok"}`

### Documents (ingestion)

- **POST** `/documents/upload`
  - **Summary**: Upload one or more documents for async ingestion.
  - **Description**: Accepts files as `multipart/form-data`, saves them, and enqueues background ingestion jobs.
  - **Request**:
    - `multipart/form-data` with one or more `files` fields:
      - `files`: file(s) to ingest (`pdf`, `docx`, `txt`, `md`, etc.).
  - **Response** (`202 Accepted`):
    ```json
    {
      "documents": [
        {
          "id": "doc-uuid",
          "title": "my_file.pdf",
          "status": "queued"
        }
      ]
    }
    ```

- **GET** `/documents`
  - **Summary**: List all documents and their ingestion status.
  - **Response** (`200 OK`):
    ```json
    [
      {
        "id": "doc-uuid",
        "title": "my_file.pdf",
        "content_type": "pdf",
        "status": "processed",
        "num_chunks": 45,
        "created_at": "2026-03-02T12:34:56Z",
        "updated_at": "2026-03-02T12:35:30Z"
      }
    ]
    ```

- **GET** `/documents/{document_id}/status`
  - **Summary**: Get ingestion status for a single document.
  - **Response** (`200 OK`):
    ```json
    {
      "id": "doc-uuid",
      "title": "my_file.pdf",
      "status": "processed",
      "num_chunks": 45,
      "error_message": null,
      "created_at": "2026-03-02T12:34:56Z",
      "updated_at": "2026-03-02T12:35:30Z",
      "jobs": [
        {
          "id": "job-uuid",
          "status": "succeeded",
          "error_message": null,
          "created_at": "2026-03-02T12:34:57Z",
          "started_at": "2026-03-02T12:34:58Z",
          "finished_at": "2026-03-02T12:35:29Z"
        }
      ]
    }
    ```

### Query (retrieval + generation)

- **POST** `/query`
  - **Summary**: Query documents using semantic search + Gemini.
  - **Description**: Embeds the query, retrieves top-k relevant chunks from all ingested documents, and asks Gemini to answer using only those chunks, with detailed citations.
  - **Request body**:
    ```json
    {
      "query": "How is document ingestion handled?",
      "top_k": 5,
      "filters": {
        "document_ids": ["doc-uuid-1", "doc-uuid-2"],
        "content_types": ["pdf", "text"]
      }
    }
    ```
    - `query` (string, required): user question.
    - `top_k` (int, optional, default 5): number of chunks to retrieve.
    - `filters` (optional):
      - `document_ids`: restrict search to specific documents.
      - `content_types`: restrict by content type.

  - **Response** (`200 OK`):
    ```json
    {
      "answer": "Document ingestion is handled asynchronously using a task queue. [1][2]",
      "citations": [
        {
          "id": 1,
          "document_id": "doc-uuid-1",
          "document_title": "System Design Overview.pdf",
          "location": {
            "page_number": 5,
            "section_heading": "Ingestion Pipeline",
            "chunk_index": 3,
            "start_time_sec": null,
            "end_time_sec": null
          },
          "snippet": "Uploads are processed through a background task queue...",
          "similarity_score": 0.12
        }
      ]
    }
    ```

  - If no relevant chunks are found:
    ```json
    {
      "answer": "I do not have an answer to this question based on the documents I have access to.",
      "citations": []
    }
    ```

 
 ## Structure (planned)
 
 - `app/main.py` – FastAPI app and router mounting
 - `app/config.py` – configuration and environment variables
 - `app/routers/` – HTTP endpoints (`documents`, `query`)
 - `app/services/` – ingestion and query services, chunking, parsing
 - `app/db/` – SQLAlchemy models and DB session
 - `app/vectorstore/` – ChromaDB client and helpers
 - `app/llm/` – Gemini embeddings and chat clients
 - `app/tasks/` – Celery task definitions for async ingestion
 
