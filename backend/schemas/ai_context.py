from typing import Any, Dict, List, Optional
from pydantic import BaseModel

class AIContextResponse(BaseModel):
    election_id: str
    title: str
    status: str
    description: Optional[str] = None
    candidates: List[Dict[str, Any]]
    turnout: Dict[str, Any]
    knowledge_base: Dict[str, Any]
