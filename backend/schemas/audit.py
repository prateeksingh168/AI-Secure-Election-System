from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
from models.audit_log import ActorType, AuditStatus

class AuditLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    log_id: str
    actor_type: ActorType
    actor_id: str
    action: str
    election_id: Optional[str] = None
    timestamp: datetime
    status: AuditStatus
