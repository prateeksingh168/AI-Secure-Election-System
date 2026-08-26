from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from models import User, UserRole, Election, ElectionStatus, Candidate, Vote, Voter, VoteStatus
from schemas import ElectionResultsResponse, CandidateVoteCount
from services import get_current_user

router = APIRouter(prefix="/elections", tags=["Results"])

@router.get("/{election_id}/results", response_model=ElectionResultsResponse)
def get_election_results(
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

    # Authorization: Admin can view results anytime; Voters/others can only view if CLOSED
    is_admin = (current_user.role == UserRole.ADMIN)
    if not is_admin and election.status != ElectionStatus.CLOSED:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Election results are confidential until the election is CLOSED"
        )

    # Total eligible voters
    total_eligible_voters = db.query(Voter).filter(Voter.eligible == True).count()

    # Total votes cast
    total_votes_cast = db.query(Vote).filter(
        Vote.election_id == election_id,
        Vote.vote_status == VoteStatus.COUNTED
    ).count()

    # Calculate turnout percentage
    turnout_percentage = 0.0
    if total_eligible_voters > 0:
        turnout_percentage = round((total_votes_cast / total_eligible_voters) * 100.0, 2)

    # Candidate-wise aggregation
    candidates = db.query(Candidate).filter(Candidate.election_id == election_id).all()
    
    # Query vote counts grouped by candidate_id
    vote_counts_query = db.query(
        Vote.candidate_id,
        func.count(Vote.vote_id).label("count")
    ).filter(
        Vote.election_id == election_id,
        Vote.vote_status == VoteStatus.COUNTED
    ).group_by(Vote.candidate_id).all()

    vote_map = {cand_id: cnt for cand_id, cnt in vote_counts_query}

    candidate_results: List[CandidateVoteCount] = []
    for cand in candidates:
        candidate_results.append(CandidateVoteCount(
            candidate_id=cand.candidate_id,
            name=cand.name,
            department=cand.department,
            symbol=cand.symbol,
            vote_count=vote_map.get(cand.candidate_id, 0)
        ))

    # Sort candidate results by vote_count descending
    candidate_results.sort(key=lambda c: c.vote_count, reverse=True)

    return ElectionResultsResponse(
        election_id=election.election_id,
        title=election.title,
        status=election.status.value if isinstance(election.status, ElectionStatus) else str(election.status),
        total_eligible_voters=total_eligible_voters,
        total_votes_cast=total_votes_cast,
        turnout_percentage=turnout_percentage,
        candidate_results=candidate_results
    )
