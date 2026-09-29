from abc import ABC, abstractmethod
from typing import Optional


class SocialPlatformAdapter(ABC):
    @abstractmethod
    async def connect(self, code: str, redirect_uri: str) -> dict:
        pass

    @abstractmethod
    async def disconnect(self, access_token: str) -> bool:
        pass

    @abstractmethod
    async def publish(self, access_token: str, caption: str, media_url: Optional[str] = None) -> dict:
        pass

    @abstractmethod
    async def schedule(self, access_token: str, caption: str, scheduled_time: str, media_url: Optional[str] = None) -> dict:
        pass

    @abstractmethod
    async def get_status(self, access_token: str, post_id: str) -> dict:
        pass

    @abstractmethod
    async def refresh_token(self, refresh_token: str) -> dict:
        pass
