import mimetypes
from pathlib import Path
from typing import Tuple
 
from fastapi import UploadFile
 
from config import get_settings
 
 
def get_storage_root() -> Path:
    settings = get_settings()
    root = Path(settings.storage_dir)
    root.mkdir(parents=True, exist_ok=True)
    return root
 
 
def save_upload_file(document_id: str, upload: UploadFile) -> Tuple[str, str]:
    """
    Save an uploaded file under a document-specific directory.

    Returns:
        storage_uri: relative path where the file is stored
        mime_type: detected MIME type
    """
    root = get_storage_root()
    doc_dir = root / document_id
    doc_dir.mkdir(parents=True, exist_ok=True)
 
    dest_path = doc_dir / upload.filename
    with dest_path.open("wb") as out_file:
        out_file.write(upload.file.read())
 
    mime_type, _ = mimetypes.guess_type(upload.filename)
    if mime_type is None:
        mime_type = upload.content_type or "application/octet-stream"
 
    storage_uri = str(dest_path)
    return storage_uri, mime_type
 
