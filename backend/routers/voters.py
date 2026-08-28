from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from database import get_db
from models import User, Voter, VoterParticipation
from schemas import VoterEligibilityResponse
from services import require_voter

router = APIRouter(prefix="/voters", tags=["Voters"])

@router.get("/me/eligibility", response_model=VoterEligibilityResponse)
def get_voter_eligibility(
    election_id: Optional[str] = Query(None),
    current_user: User = Depends(require_voter),
    db: Session = Depends(get_db)
):
    if not current_user.voter_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No voter profile associated with this user account"
        )
    
    voter = db.query(Voter).filter(Voter.voter_id == current_user.voter_id).first()
    if not voter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Voter record not found"
        )

    # Compute has_voted dynamically relative to election_id
    has_voted = False
    if election_id:
        has_voted = db.query(VoterParticipation).filter(
            VoterParticipation.voter_id == voter.voter_id,
            VoterParticipation.election_id == election_id
        ).first() is not None

    return VoterEligibilityResponse(
        voter_id=voter.voter_id,
        name=voter.name,
        email=voter.email,
        eligible=voter.eligible,
        verification_status=voter.verification_status,
        has_voted=has_voted,
        role=voter.role
    )
