import os
import json
from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import Election, Candidate, Vote, Voter, VoteStatus, User, UserRole, ElectionEligibility
from schemas import AIContextResponse, AIAskRequest, AIAskResponse
from services import get_current_user

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
def get_ai_context(
    election_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )

    # If voter, verify election-specific registration eligibility
    if current_user.role == UserRole.VOTER:
        is_eligible = db.query(ElectionEligibility).filter(
            ElectionEligibility.election_id == election_id,
            ElectionEligibility.voter_id == current_user.voter_id
        ).first() is not None
        if not is_eligible:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. You are not registered for this election."
            )

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

    # Calculate election-specific turnout
    total_eligible = db.query(ElectionEligibility).filter(
        ElectionEligibility.election_id == election_id
    ).count()

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



@router.post("/ask/{election_id}", response_model=AIAskResponse)
def ask_ai(
    election_id: str,
    request: AIAskRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )

    election = db.query(Election).filter(
        Election.election_id == election_id
    ).first()

    if not election:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Election not found"
        )

    question = request.question.strip().lower()

    if not question:
        return AIAskResponse(
            answer="Please enter a question.",
            election_id=election_id
        )

    knowledge_base = get_knowledge_base()

    def find_items(*sections):
        results = []
        for section in sections:
            for item in knowledge_base.get(section, []):
                title = str(item.get("title", "")).lower()
                content = str(item.get("content", "")).lower()
                results.append((title, content, item.get("content", "")))
        return results

    # Age — check BEFORE general eligibility
    if any(word in question for word in [
        "minimum age", "age requirement", "how old", "voting age"
    ]):
        return AIAskResponse(
            answer=(
                "The minimum voting age is 18 years. "
                "Voters must also be registered and meet the applicable "
                "eligibility requirements."
            ),
            election_id=election_id
        )

    # Eligibility
    if any(word in question for word in [
        "eligible", "eligibility", "who can vote",
        "voting criteria", "criteria", "qualification"
    ]):
        items = find_items("election_rules")
        for title, content, original in items:
            if "eligib" in title or "registered" in content:
                return AIAskResponse(
                    answer=original,
                    election_id=election_id
                )

    # Age
    if any(word in question for word in [
        "minimum age", "age requirement", "how old", "age"
    ]):
        return AIAskResponse(
            answer=(
                "The current election knowledge base states that voters "
                "must meet the age requirements set by the election authority. "
                "It does not specify an exact minimum age."
            ),
            election_id=election_id
        )

    # Voting process
    if any(word in question for word in [
        "how to vote", "voting process", "vote process",
        "cast vote", "how do i vote"
    ]):
        items = find_items("voting_procedure")
        answer = "\n".join(
            f"{title}: {original}" for title, content, original in items
        )
        return AIAskResponse(
            answer=answer,
            election_id=election_id
        )

    # Duplicate voting
    if any(word in question for word in [
        "duplicate", "vote twice", "more than once",
        "second vote", "two votes"
    ]):
        items = find_items("election_rules", "faqs", "security_information")
        for title, content, original in items:
            if (
                "duplicate" in title
                or "more than once" in content
                or "one person one vote" in title
            ):
                return AIAskResponse(
                    answer=original,
                    election_id=election_id
                )

    # Vote privacy
    if any(word in question for word in [
        "private", "privacy", "secret", "see my vote",
        "officer see", "election officer"
    ]):
        items = find_items("election_rules", "faqs")
        for title, content, original in items:
            if "privacy" in title or "see my vote" in title:
                return AIAskResponse(
                    answer=original,
                    election_id=election_id
                )

    # Receipt
    if any(word in question for word in [
        "receipt", "submitted", "submission", "confirmation"
    ]):
        items = find_items("faqs", "voting_procedure")
        for title, content, original in items:
            if "submitted" in title or "receipt" in content:
                return AIAskResponse(
                    answer=original,
                    election_id=election_id
                )

    # Candidates
    if any(word in question for word in [
        "candidate", "candidates", "contestant", "contestants",
        "who is contesting", "who are contesting"
    ]):
        candidates = db.query(Candidate).filter(
            Candidate.election_id == election_id
        ).all()

        if candidates:
            answer = "Candidates:\n" + "\n".join(
                f"• {c.name} — {c.department}"
                for c in candidates
            )
        else:
            answer = "No candidate information is available."

        return AIAskResponse(
            answer=answer,
            election_id=election_id
        )

    # Security features
    if any(word in question for word in [
        "security", "secure", "security features",
        "how is the system secure", "protection"
    ]):
        return AIAskResponse(
            answer=(
                "The system uses authentication, biometric verification, "
                "duplicate-vote prevention, audit logs, and separation "
                "of voter identity from ballot choice to improve election "
                "security and accountability."
            ),
            election_id=election_id
        )
    # Election dates / schedule
    if any(word in question for word in [
        "date", "dates", "when", "schedule",
        "voting period", "start", "end", "deadline"
    ]):
        start_date = getattr(election, "start_date", None)
        end_date = getattr(election, "end_date", None)

        answer = (
            f"The election '{election.title}' is scheduled from "
            f"{start_date.strftime('%d %b %Y') if start_date else 'N/A'} "
            f"to "
            f"{end_date.strftime('%d %b %Y') if end_date else 'N/A'}."
        )

        return AIAskResponse(
            answer=answer,
            election_id=election_id
        )

    # Candidates
    if any(word in question for word in [
        "candidate", "candidates", "contestants",
        "who is contesting"
    ]):
        candidates = db.query(Candidate).filter(
            Candidate.election_id == election_id
        ).all()

        if candidates:
            answer = "Candidates:\n" + "\n".join(
                f"• {c.name} — {c.department}"
                for c in candidates
            )
        else:
            answer = "No candidate information is available."

        return AIAskResponse(
            answer=answer,
            election_id=election_id
        )

    # Turnout / analytics
    if any(word in question for word in [
        "turnout", "votes cast", "participation",
        "analytics", "how many votes"
    ]):
        total_eligible = db.query(ElectionEligibility).filter(
            ElectionEligibility.election_id == election_id
        ).count()

        total_votes = db.query(Vote).filter(
            Vote.election_id == election_id,
            Vote.vote_status == VoteStatus.COUNTED
        ).count()

        percentage = (
            round((total_votes / total_eligible) * 100, 2)
            if total_eligible > 0
            else 0
        )

        answer = (
            f"Current election participation: {total_votes} votes cast "
            f"out of {total_eligible} eligible voters "
            f"({percentage}% turnout)."
        )

        return AIAskResponse(
            answer=answer,
            election_id=election_id
        )

    # Fallback
    return AIAskResponse(
        answer=(
            "I can help with voter eligibility, voting criteria, "
            "voting process, election dates, candidates, vote privacy, "
            "duplicate voting, receipts, turnout, and election status."
        ),
        election_id=election_id
    )



