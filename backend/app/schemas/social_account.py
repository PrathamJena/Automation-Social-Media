from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID


class SocialAccountResponse(BaseModel):
    id: UUID
    user_id: UUID
    platform: str
    account_name: Optional[str]
    account_id: Optional[str]
    status: str
    expires_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


class OAuthInitiateRequest(BaseModel):
    platform: str


class OAuthCallbackRequest(BaseModel):
    code: str
    state: str
