from typing import Optional
from pydantic import BaseModel, ConfigDict
from models.voter import VerificationStatus

class VoterEligibilityResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    voter_id: str
    name: str
    email: str
    eligible: bool
    verification_status: VerificationStatus
    has_voted: bool
    role: str

class VoterResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    voter_id: str
    name: str
    email: str
    phone: Optional[str] = None
    eligible: bool
    verification_status: VerificationStatus
    has_voted: bool
    role: str
