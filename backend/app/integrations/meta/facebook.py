from app.integrations.base import SocialPlatformAdapter
from app.integrations.meta.oauth import MetaOAuth
from app.core.config import get_settings

settings = get_settings()


class FacebookAdapter(SocialPlatformAdapter):
    def __init__(self):
        self.oauth = MetaOAuth(
            client_id=settings.FACEBOOK_CLIENT_ID,
            client_secret=settings.FACEBOOK_CLIENT_SECRET,
            redirect_uri=settings.FACEBOOK_REDIRECT_URI,
        )

    async def connect(self, code: str, redirect_uri: str) -> dict:
        return await self.oauth.exchange_code(code)

    async def disconnect(self, access_token: str) -> bool:
        return True

    async def publish(self, access_token: str, caption: str, media_url: str = None) -> dict:
        return {"success": True, "post_id": "fb_placeholder"}

    async def schedule(self, access_token: str, caption: str, scheduled_time: str, media_url: str = None) -> dict:
        return {"success": True, "post_id": "fb_scheduled_placeholder"}

    async def get_status(self, access_token: str, post_id: str) -> dict:
        return {"status": "published"}

    async def refresh_token(self, refresh_token: str) -> dict:
        return await self.oauth.refresh_access_token(refresh_token)
