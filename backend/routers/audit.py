from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from database import get_db
from models import User, AuditLog, AuditStatus
from schemas import AuditLogResponse
from services import require_admin

router = APIRouter(prefix="/audit-logs", tags=["Audit"])

@router.get("", response_model=List[AuditLogResponse])
def get_audit_logs(
    election_id: Optional[str] = Query(None),
    action: Optional[str] = Query(None),
    audit_status: Optional[AuditStatus] = Query(None, alias="status"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(50, ge=1, le=100, description="Records per page"),
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    query = db.query(AuditLog)
    if election_id:
        query = query.filter(AuditLog.election_id == election_id)
    if action:
        query = query.filter(AuditLog.action == action)
    if audit_status:
        query = query.filter(AuditLog.status == audit_status)

    offset = (page - 1) * limit
    logs = query.order_by(AuditLog.timestamp.desc()).offset(offset).limit(limit).all()
    return logs
