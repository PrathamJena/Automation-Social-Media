import httpx
from app.integrations.base import SocialPlatformAdapter
from app.core.config import get_settings

settings = get_settings()


class LinkedInAdapter(SocialPlatformAdapter):
    def get_authorization_url(self, state: str) -> str:
        return (
            f"https://www.linkedin.com/oauth/v2/authorization?"
            f"response_type=code&client_id={settings.LINKEDIN_CLIENT_ID}"
            f"&redirect_uri={settings.LINKEDIN_REDIRECT_URI}"
            f"&state={state}&scope=r_liteprofile%2w_member_social"
        )

    async def connect(self, code: str, redirect_uri: str) -> dict:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://www.linkedin.com/oauth/v2/accessToken",
                data={
                    "grant_type": "authorization_code",
                    "code": code,
                    "redirect_uri": redirect_uri,
                    "client_id": settings.LINKEDIN_CLIENT_ID,
                    "client_secret": settings.LINKEDIN_CLIENT_SECRET,
                },
            )
            response.raise_for_status()
            return response.json()

    async def disconnect(self, access_token: str) -> bool:
        return True

    async def publish(self, access_token: str, caption: str, media_url: str = None) -> dict:
        return {"success": True, "post_id": "li_placeholder"}

    async def schedule(self, access_token: str, caption: str, scheduled_time: str, media_url: str = None) -> dict:
        return {"success": True, "post_id": "li_scheduled_placeholder"}

    async def get_status(self, access_token: str, post_id: str) -> dict:
        return {"status": "published"}

    async def refresh_token(self, refresh_token: str) -> dict:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://www.linkedin.com/oauth/v2/accessToken",
                data={
                    "grant_type": "refresh_token",
                    "refresh_token": refresh_token,
                    "client_id": settings.LINKEDIN_CLIENT_ID,
                    "client_secret": settings.LINKEDIN_CLIENT_SECRET,
                },
            )
            response.raise_for_status()
            return response.json()
