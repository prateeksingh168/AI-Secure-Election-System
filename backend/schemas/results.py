from typing import List
from pydantic import BaseModel

class CandidateVoteCount(BaseModel):
    candidate_id: str
    name: str
    department: str
    symbol: str
    vote_count: int

class ElectionResultsResponse(BaseModel):
    election_id: str
    title: str
    status: str
    total_eligible_voters: int
    total_votes_cast: int
    turnout_percentage: float
    candidate_results: List[CandidateVoteCount]
