from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class PostCreate(BaseModel):
    caption: Optional[str] = ""
    scheduled_at: Optional[datetime] = None
    platforms: Optional[List[str]] = []
    # Media attached to the post
    file_url: Optional[str] = None
    file_type: Optional[str] = None
    file_name: Optional[str] = None
    file_size: Optional[str] = None


class PostUpdate(BaseModel):
    caption: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    platforms: Optional[List[str]] = None


class PostResponse(BaseModel):
    id: str
    created_by: str
    caption: str
    status: str
    scheduled_at: Optional[datetime]
    published_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PostMediaResponse(BaseModel):
    id: str
    post_id: str
    file_url: str
    file_type: str
    file_name: str
    file_size: Optional[str]

    class Config:
        from_attributes = True


class PostPlatformResponse(BaseModel):
    id: str
    post_id: str
    platform: str
    status: str
    external_post_id: Optional[str]
    error_message: Optional[str]

    class Config:
        from_attributes = True
