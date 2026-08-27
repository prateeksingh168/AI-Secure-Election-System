import os
import json
from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import Election, Candidate, Vote, Voter, VoteStatus
from schemas import AIContextResponse

router = APIRouter(prefix="/ai", tags=["AI Integration"])

def get_knowledge_base() -> Dict[str, Any]:
    # Allow override via environment variable
    env_path = os.getenv("KNOWLEDGE_BASE_PATH")
    if env_path and os.path.exists(env_path):
        try:
            with open(env_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading knowledge base from env path '{env_path}': {e}")

    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(current_dir, "..", ".."))

    possible_paths = [
        os.path.join(project_root, "ai", "knowledge", "election_knowledge.json"),
        os.path.abspath(os.path.join(current_dir, "..", "..", "ai", "knowledge", "election_knowledge.json")),
        os.path.abspath(os.path.join(current_dir, "..", "ai", "knowledge", "election_knowledge.json")),
    ]
    for path in possible_paths:
        if os.path.exists(path):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                print(f"Error loading knowledge base from path '{path}': {e}")
    return {}

@router.get("/context/{election_id}", response_model=AIContextResponse)
def get_ai_context(election_id: str, db: Session = Depends(get_db)):
    election = db.query(Election).filter(Election.election_id == election_id).first()
    if not election:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Election not found"
        )

    candidates = db.query(Candidate).filter(Candidate.election_id == election_id).all()
    cand_list = [
        {
            "candidate_id": c.candidate_id,
            "name": c.name,
            "department": c.department,
            "symbol": c.symbol,
            "manifesto": c.manifesto
        }
        for c in candidates
    ]

    total_eligible = db.query(Voter).filter(Voter.eligible == True).count()
    total_votes = db.query(Vote).filter(
        Vote.election_id == election_id,
        Vote.vote_status == VoteStatus.COUNTED
    ).count()

    turnout_percentage = round((total_votes / total_eligible) * 100.0, 2) if total_eligible > 0 else 0.0

    knowledge_base = get_knowledge_base()

    return AIContextResponse(
        election_id=election.election_id,
        title=election.title,
        status=election.status.value if hasattr(election.status, "value") else str(election.status),
        description=election.description,
        candidates=cand_list,
        turnout={
            "total_eligible_voters": total_eligible,
            "total_votes_cast": total_votes,
            "turnout_percentage": turnout_percentage
        },
        knowledge_base=knowledge_base
    )
