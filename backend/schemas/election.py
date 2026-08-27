from datetime import date
from typing import Optional
from pydantic import BaseModel, ConfigDict
from models.election import ElectionStatus

class ElectionCreate(BaseModel):
    title: str
    description: Optional[str] = None
    start_date: date
    end_date: date
    rules_version: Optional[str] = "1.0"

class ElectionStatusUpdate(BaseModel):
    status: ElectionStatus

class ElectionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    election_id: str
    title: str
    description: Optional[str] = None
    start_date: date
    end_date: date
    status: ElectionStatus
    rules_version: str
