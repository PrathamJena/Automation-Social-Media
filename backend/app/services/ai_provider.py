import base64
import httpx
from app.core.config import get_settings

settings = get_settings()

# Model used to look at images. Must be a vision-capable Ollama model.
# Install once with:  ollama pull llava
VISION_MODEL = settings.OLLAMA_VISION_MODEL


class AIProvider:
    async def generate_caption(
        self, topic: str, tone: str, platform: str, audience: str
    ) -> dict:
        raise NotImplementedError

    async def caption_from_image(
        self,
        image_bytes: bytes,
        content_type: str,
        tone: str,
        audience: str,
        extra_context: str = "",
    ) -> dict:
        raise NotImplementedError


def _parse_response(text: str) -> dict:
    """Parse the model output into caption + hashtags."""
    caption = text.strip()
    hashtags = []

    if "CAPTION:" in text:
        parts = text.split("HASHTAGS:")
        caption = parts[0].replace("CAPTION:", "").strip()
        if len(parts) > 1:
            raw = parts[1].replace("\n", " ")
            hashtags = [h.strip() for h in raw.split() if h.strip().startswith("#")]

    # Cap hashtags and remove duplicates
    seen = set()
    clean = []
    for tag in hashtags:
        key = tag.lower()
        if key not in seen:
            seen.add(key)
            clean.append(tag)

    return {"caption": caption, "hashtags": clean[:15]}


class OllamaProvider(AIProvider):
    async def generate_caption(
        self, topic: str, tone: str, platform: str, audience: str
    ) -> dict:
        prompt = f"""Write a {tone} social media caption for {platform} about {topic}.
Target audience: {audience}.
Keep it under 500 characters. Provide 5-8 relevant hashtags.
You must reply using exactly this format:
CAPTION: <your caption>
HASHTAGS: <hashtags separated by spaces>"""

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{settings.OLLAMA_BASE_URL}/api/generate",
                json={
                    "model": settings.OLLAMA_MODEL,
                    "prompt": prompt,
                    "stream": False,
                    "options": {"temperature": 0.8},
                },
                timeout=120.0,
            )
            response.raise_for_status()
            result = response.json()

        return _parse_response(result.get("response", ""))

    async def caption_from_image(
        self,
        image_bytes: bytes,
        content_type: str,
        tone: str,
        audience: str,
        extra_context: str = "",
    ) -> dict:
        """Look at the image and write a caption for it."""
        encoded = base64.b64encode(image_bytes).decode("utf-8")

        context_line = f"\nExtra context from the user: {extra_context}" if extra_context else ""

        prompt = f"""Look at this image and describe it accurately in one sentence.

Then write a {tone} social media caption based on the image.
Target audience: {audience}.{context_line}

Keep the caption under 500 characters. Provide 5-8 relevant hashtags.
You must reply using exactly this format:
CAPTION: <your caption>
HASHTAGS: <hashtags separated by spaces>"""

        payload = {
            "model": VISION_MODEL,
            "prompt": prompt,
            "stream": False,
            "images": [encoded],
            "options": {"temperature": 0.7},
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{settings.OLLAMA_BASE_URL}/api/generate", json=payload, timeout=180.0
            )
            response.raise_for_status()
            result = response.json()

        return _parse_response(result.get("response", ""))


def get_ai_provider() -> AIProvider:
    if settings.AI_PROVIDER == "ollama":
        return OllamaProvider()
    raise ValueError(f"Unsupported AI provider: {settings.AI_PROVIDER}")
