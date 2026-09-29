from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID


class AuditLogResponse(BaseModel):
    id: UUID
    user_id: Optional[UUID]
    action: str
    entity: str
    entity_id: Optional[str]
    metadata: Optional[dict]
    created_at: datetime

    class Config:
        from_attributes = True
