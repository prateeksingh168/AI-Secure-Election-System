import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from database import get_db
from models import User, Election, ElectionStatus, ActorType, AuditStatus
from schemas import ElectionCreate, ElectionResponse, ElectionStatusUpdate
from services import get_current_user, require_admin, log_audit_event

router = APIRouter(prefix="/elections", tags=["Elections"])

@router.get("", response_model=List[ElectionResponse])
def list_elections(
    status_filter: Optional[ElectionStatus] = Query(None, alias="status"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Election)
    if status_filter:
        query = query.filter(Election.status == status_filter)
    return query.all()

@router.get("/{election_id}", response_model=ElectionResponse)
def get_election(
    election_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    election = db.query(Election).filter(Election.election_id == election_id).first()
    if not election:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Election not found"
        )
    return election

@router.post("", response_model=ElectionResponse, status_code=status.HTTP_201_CREATED)
def create_election(
    election_in: ElectionCreate,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    election_id = f"E{uuid.uuid4().hex[:4].upper()}"
    new_election = Election(
        election_id=election_id,
        title=election_in.title,
        description=election_in.description,
        start_date=election_in.start_date,
        end_date=election_in.end_date,
        status=ElectionStatus.DRAFT,
        rules_version=election_in.rules_version or "1.0"
    )
    db.add(new_election)
    db.commit()
    db.refresh(new_election)

    log_audit_event(
        db,
        actor_type=ActorType.ADMIN,
        actor_id=current_admin.user_id,
        action="ELECTION_CREATED",
        election_id=election_id,
        audit_status=AuditStatus.SUCCESS
    )

    return new_election

@router.patch("/{election_id}/status", response_model=ElectionResponse)
def update_election_status(
    election_id: str,
    status_update: ElectionStatusUpdate,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    election = db.query(Election).filter(Election.election_id == election_id).first()
    if not election:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Election not found"
        )

    old_status = election.status
    new_status = status_update.status

    election.status = new_status
    db.commit()
    db.refresh(election)

    action_name = f"ELECTION_STATUS_CHANGED_{new_status.value}"
    if new_status == ElectionStatus.ACTIVE:
        action_name = "ELECTION_ACTIVATED"
    elif new_status == ElectionStatus.CLOSED:
        action_name = "ELECTION_CLOSED"

    log_audit_event(
        db,
        actor_type=ActorType.ADMIN,
        actor_id=current_admin.user_id,
        action=action_name,
        election_id=election_id,
        audit_status=AuditStatus.SUCCESS
    )

    return election
