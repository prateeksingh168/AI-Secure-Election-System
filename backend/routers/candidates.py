import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import User, Election, Candidate, ActorType, AuditStatus
from schemas import CandidateCreate, CandidateResponse
from services import require_admin, log_audit_event, get_current_user

router = APIRouter(prefix="/elections", tags=["Candidates"])

@router.get("/{election_id}/candidates", response_model=List[CandidateResponse])
def list_candidates(
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
    return db.query(Candidate).filter(Candidate.election_id == election_id).all()

@router.post("/{election_id}/candidates", response_model=CandidateResponse, status_code=status.HTTP_201_CREATED)
def add_candidate(
    election_id: str,
    candidate_in: CandidateCreate,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    election = db.query(Election).filter(Election.election_id == election_id).first()
    if not election:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Election not found"
        )

    candidate_id = f"C{uuid.uuid4().hex[:4].upper()}"
    new_candidate = Candidate(
        candidate_id=candidate_id,
        election_id=election_id,
        name=candidate_in.name,
        department=candidate_in.department,
        symbol=candidate_in.symbol,
        manifesto=candidate_in.manifesto
    )
    db.add(new_candidate)
    db.commit()
    db.refresh(new_candidate)

    log_audit_event(
        db,
        actor_type=ActorType.ADMIN,
        actor_id=current_admin.user_id,
        action="CANDIDATES_ADDED",
        election_id=election_id,
        audit_status=AuditStatus.SUCCESS
    )

    return new_candidate
