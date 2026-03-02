from pathlib import Path
from typing import Iterable, List, Optional

from pypdf import PdfReader
from docx import Document as DocxDocument

from models import Document


class ParsedSegment:
    def __init__(
        self,
        text: str,
        page_number: Optional[int] = None,
        section_heading: Optional[str] = None,
        start_time_sec: Optional[float] = None,
        end_time_sec: Optional[float] = None,
    ) -> None:
        self.text = text
        self.page_number = page_number
        self.section_heading = section_heading
        self.start_time_sec = start_time_sec
        self.end_time_sec = end_time_sec


class ParsingPipeline:
    """
    Multimodal-aware parsing pipeline.

    For now, implements:
    - text / markdown
    - PDF
    - DOCX
    Other modalities (images, audio, video) are stubbed for future extension.
    """

    def parse(self, document: Document) -> List[ParsedSegment]:
        path = Path(document.storage_uri)
        mime = document.mime_type or ""

        if mime.startswith("text/") or path.suffix.lower() in {".txt", ".md", ".markdown"}:
            return self._parse_text(path)
        if mime in {"application/pdf"} or path.suffix.lower() == ".pdf":
            return self._parse_pdf(path)
        if path.suffix.lower() in {".docx"}:
            return self._parse_docx(path)

        # Stub for images / audio / video: can be extended later.
        # For now, fall back to treating as generic text if readable.
        return self._parse_text(path)

    def _parse_text(self, path: Path) -> List[ParsedSegment]:
        text = path.read_text(encoding="utf-8", errors="ignore")
        # Simple paragraph split; chunker will further process.
        paragraphs: Iterable[str] = [p.strip() for p in text.split("\n\n") if p.strip()]
        return [ParsedSegment(text=p) for p in paragraphs]

    def _parse_pdf(self, path: Path) -> List[ParsedSegment]:
        segments: List[ParsedSegment] = []
        reader = PdfReader(str(path))
        for page_idx, page in enumerate(reader.pages):
            text = page.extract_text() or ""
            if text.strip():
                segments.append(ParsedSegment(text=text.strip(), page_number=page_idx + 1))
        return segments

    def _parse_docx(self, path: Path) -> List[ParsedSegment]:
        doc = DocxDocument(str(path))
        segments: List[ParsedSegment] = []
        current_heading: Optional[str] = None
        for para in doc.paragraphs:
            text = para.text.strip()
            if not text:
                continue
            style_name = getattr(para.style, "name", "") or ""
            if "Heading" in style_name:
                current_heading = text
                continue
            segments.append(ParsedSegment(text=text, section_heading=current_heading))
        return segments

