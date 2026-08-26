from typing import Optional
from pydantic import BaseModel, ConfigDict

class CandidateCreate(BaseModel):
    name: str
    department: str
    symbol: str
    manifesto: Optional[str] = None

class CandidateResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    candidate_id: str
    election_id: str
    name: str
    department: str
    symbol: str
    manifesto: Optional[str] = None
