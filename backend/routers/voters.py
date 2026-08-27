from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import User, Voter
from schemas import VoterEligibilityResponse
from services import get_current_user

router = APIRouter(prefix="/voters", tags=["Voters"])

@router.get("/me/eligibility", response_model=VoterEligibilityResponse)
def get_voter_eligibility(
    current_user: User = Depends(get_current_user),
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

    return voter
