from app.integrations.base import SocialPlatformAdapter
from app.core.config import get_settings

settings = get_settings()


class WhatsAppAdapter(SocialPlatformAdapter):
    """WhatsApp Business API adapter for messaging (not Status posting)."""

    async def connect(self, code: str, redirect_uri: str) -> dict:
        return {"success": True}

    async def disconnect(self, access_token: str) -> bool:
        return True

    async def publish(self, access_token: str, caption: str, media_url: str = None) -> dict:
        return {"success": True, "message_id": "wa_placeholder"}

    async def schedule(self, access_token: str, caption: str, scheduled_time: str, media_url: str = None) -> dict:
        return {"success": True, "message_id": "wa_scheduled_placeholder"}

    async def get_status(self, access_token: str, post_id: str) -> dict:
        return {"status": "sent"}

    async def refresh_token(self, refresh_token: str) -> dict:
        return {"success": True}
