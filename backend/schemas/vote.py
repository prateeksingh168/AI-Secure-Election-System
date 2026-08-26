from datetime import datetime
from pydantic import BaseModel, ConfigDict
from models.vote import VoteStatus

class VoteRequest(BaseModel):
    candidate_id: str

class VoteResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    vote_id: str
    election_id: str
    candidate_id: str
    cast_at: datetime
    vote_status: VoteStatus
    message: str = "Vote cast successfully"
