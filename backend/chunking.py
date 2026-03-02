from dataclasses import dataclass
from typing import List, Optional, Sequence

from parsing import ParsedSegment


@dataclass
class Chunk:
    text: str
    chunk_index: int
    page_number: Optional[int] = None
    section_heading: Optional[str] = None
    start_char: Optional[int] = None
    end_char: Optional[int] = None
    start_time_sec: Optional[float] = None
    end_time_sec: Optional[float] = None


class ChunkingService:
    def __init__(self, target_chars: int = 3000, overlap_chars: int = 500) -> None:
        self.target_chars = target_chars
        self.overlap_chars = overlap_chars

    def chunk(self, segments: Sequence[ParsedSegment]) -> List[Chunk]:
        chunks: List[Chunk] = []
        buffer: List[ParsedSegment] = []
        buffer_len = 0
        global_offset = 0
        chunk_index = 0

        def flush_buffer(
            buf: List[ParsedSegment],
            idx: int,
            start_offset: int,
        ) -> Chunk:
            combined_text = "\n\n".join(s.text for s in buf)
            end_offset = start_offset + len(combined_text)
            # Use first and last segment metadata as approximate location.
            first = buf[0]
            last = buf[-1]
            return Chunk(
                text=combined_text,
                chunk_index=idx,
                page_number=first.page_number or last.page_number,
                section_heading=last.section_heading or first.section_heading,
                start_char=start_offset,
                end_char=end_offset,
                start_time_sec=first.start_time_sec,
                end_time_sec=last.end_time_sec,
            )

        for seg in segments:
            seg_len = len(seg.text)
            if seg_len == 0:
                continue

            if buffer_len + seg_len > self.target_chars and buffer:
                chunk = flush_buffer(buffer, chunk_index, global_offset)
                chunks.append(chunk)
                chunk_index += 1

                # Overlap: keep tail of previous chunk.
                overlap_text = chunk.text[-self.overlap_chars :]
                overlap_seg = ParsedSegment(text=overlap_text, page_number=chunk.page_number, section_heading=chunk.section_heading)
                buffer = [overlap_seg]
                buffer_len = len(overlap_text)
                global_offset = chunk.end_char - len(overlap_text)

            buffer.append(seg)
            buffer_len += seg_len

        if buffer:
            chunk = flush_buffer(buffer, chunk_index, global_offset)
            chunks.append(chunk)

        return chunks

