import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Enum, Text
from app.database import Base
import enum


class NotificationType(str, enum.Enum):
    POST_PUBLISHED = "post_published"
    POST_FAILED = "post_failed"
    ACCOUNT_DISCONNECTED = "account_disconnected"
    POST_APPROACHING = "post_approaching"
    TOKEN_EXPIRED = "token_expired"


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    type = Column(Enum(NotificationType), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(String(1), default="N")
    created_at = Column(DateTime, default=datetime.utcnow)
