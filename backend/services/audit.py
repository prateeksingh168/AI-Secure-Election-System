import uuid
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.orm import Session
from models.audit_log import AuditLog, ActorType, AuditStatus

def log_audit_event(
    db: Session,
    actor_type: ActorType,
    actor_id: str,
    action: str,
    election_id: Optional[str] = None,
    audit_status: AuditStatus = AuditStatus.SUCCESS
) -> AuditLog:
    log_id = f"L{uuid.uuid4().hex[:8].upper()}"
    log_entry = AuditLog(
        log_id=log_id,
        actor_type=actor_type,
        actor_id=actor_id,
        action=action,
        election_id=election_id,
        timestamp=datetime.now(timezone.utc),
        status=audit_status
    )
    db.add(log_entry)
    db.commit()
    db.refresh(log_entry)
    return log_entry
