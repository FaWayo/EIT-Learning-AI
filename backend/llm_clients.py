from typing import List, Sequence

import httpx

from config import get_settings


class GeminiEmbeddingClient:
    def __init__(self) -> None:
        settings = get_settings()
        self.api_key = settings.gemini_api_key
        self.model = settings.gemini_embeddings_model
        self._base_url = "https://generativelanguage.googleapis.com/v1beta"

    async def embed_texts(self, texts: Sequence[str]) -> List[List[float]]:
        """
        Call Gemini embeddings API for a batch of texts.
        """
        url = f"{self._base_url}/{self.model}:batchEmbedContents?key={self.api_key}"
        payload = {
            "requests": [{"model": self.model, "content": {"parts": [{"text": t}]}} for t in texts]
        }
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(url, json=payload)
            resp.raise_for_status()
            data = resp.json()
        return [item["values"] for item in data.get("embeddings", [])]


class GeminiChatClient:
    def __init__(self) -> None:
        settings = get_settings()
        self.api_key = settings.gemini_api_key
        self.model = settings.gemini_chat_model
        self._base_url = "https://generativelanguage.googleapis.com/v1beta"

    async def generate_answer(
        self,
        system_instruction: str,
        context_blocks: Sequence[str],
        user_question: str,
    ) -> str:
        """
        Call Gemini chat model with context and question.
        """
        url = f"{self._base_url}/models/{self.model}:generateContent?key={self.api_key}"
        context_text = "\n\n".join(context_blocks)
        contents = [
            {"role": "system", "parts": [{"text": system_instruction}]},
            {"role": "user", "parts": [{"text": f"{context_text}\n\nQuestion: {user_question}"}]},
        ]
        payload = {"contents": contents}
        async with httpx.AsyncClient(timeout=60) as client:
            resp = await client.post(url, json=payload)
            resp.raise_for_status()
            data = resp.json()
        candidates = data.get("candidates", [])
        if not candidates:
            return ""
        parts = candidates[0].get("content", {}).get("parts", [])
        return "".join(p.get("text", "") for p in parts)

