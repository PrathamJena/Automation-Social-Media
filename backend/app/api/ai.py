from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form
from pydantic import BaseModel
from app.models.user import User
from app.api.deps import get_current_user
from app.services.ai_provider import get_ai_provider
from app.core.config import get_settings

router = APIRouter(prefix="/api/ai", tags=["AI Assistant"])

settings = get_settings()


class GenerateCaptionRequest(BaseModel):
    topic: str
    tone: str
    platform: str
    audience: str


class GenerateCaptionResponse(BaseModel):
    caption: str
    hashtags: list[str]


@router.post("/generate-caption", response_model=GenerateCaptionResponse)
async def generate_caption(
    request: GenerateCaptionRequest,
    current_user: User = Depends(get_current_user),
):
    """Generate a caption from a topic you type."""
    if not request.topic:
        raise HTTPException(status_code=400, detail="Topic is required")

    provider = get_ai_provider()

    try:
        result = await provider.generate_caption(
            topic=request.topic,
            tone=request.tone,
            platform=request.platform,
            audience=request.audience,
        )
        return GenerateCaptionResponse(
            caption=result.get("caption", ""),
            hashtags=result.get("hashtags", []),
        )
    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail=f"AI is unavailable right now. Is Ollama running at {settings.OLLAMA_BASE_URL}?",
        )


@router.post("/caption-from-image", response_model=GenerateCaptionResponse)
async def caption_from_image(
    file: UploadFile = File(...),
    tone: str = Form("Professional"),
    audience: str = Form("General"),
    context: str = Form(""),
    current_user: User = Depends(get_current_user),
):
    """Look at an uploaded image and write a caption for it."""
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="Please upload an image (JPG, PNG or WEBP).",
        )

    image_bytes = await file.read()

    if len(image_bytes) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image must be smaller than 10 MB.")

    provider = get_ai_provider()

    try:
        result = await provider.caption_from_image(
            image_bytes=image_bytes,
            content_type=file.content_type,
            tone=tone,
            audience=audience,
            extra_context=context,
        )
        return GenerateCaptionResponse(
            caption=result.get("caption", ""),
            hashtags=result.get("hashtags", []),
        )
    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail=(
                "AI image analysis is unavailable. Make sure Ollama is running and a "
                "vision model is installed: ollama pull llava"
            ),
        )


@router.get("/status")
async def get_ai_status(current_user: User = Depends(get_current_user)):
    from app.services.ai_provider import VISION_MODEL

    return {
        "provider": settings.AI_PROVIDER,
        "model": settings.OLLAMA_MODEL,
        "vision_model": VISION_MODEL,
        "base_url": settings.OLLAMA_BASE_URL,
        "available": bool(settings.OLLAMA_BASE_URL),
    }
