from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from database import get_db
from models import User
from schemas import VoteRequest, VoteResponse
from services import get_current_user, process_vote_casting

router = APIRouter(prefix="/elections", tags=["Voting"])

@router.post("/{election_id}/vote", response_model=VoteResponse, status_code=status.HTTP_201_CREATED)
def cast_vote(
    election_id: str,
    vote_req: VoteRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    new_vote = process_vote_casting(
        db=db,
        current_user=current_user,
        election_id=election_id,
        candidate_id=vote_req.candidate_id
    )
    
    return VoteResponse(
        vote_id=new_vote.vote_id,
        election_id=new_vote.election_id,
        candidate_id=new_vote.candidate_id,
        cast_at=new_vote.cast_at,
        vote_status=new_vote.vote_status,
        message="Vote cast successfully"
    )
