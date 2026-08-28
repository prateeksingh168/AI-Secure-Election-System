import os
import uuid
from datetime import datetime, date, timezone
from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from models.user import User, UserRole
from models.voter import Voter, VerificationStatus
from models.election import Election, ElectionStatus
from models.candidate import Candidate
from models.vote import Vote, VoteStatus, VoterParticipation
from models.eligibility import ElectionEligibility
from models.audit_log import ActorType, AuditStatus
from services.audit import log_audit_event
from services.biometric_service import verify_biometric_session_token

def process_vote_casting(
    db: Session,
    current_user: User,
    election_id: str,
    candidate_id: str,
    biometric_token: Optional[str] = None
) -> Vote:
    # 1. Authenticated check (current_user must be present)
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )
    
    # Check if voter record exists for current_user
    if not current_user.voter_id:
        log_audit_event(
            db,
            actor_type=ActorType.ADMIN if current_user.role == UserRole.ADMIN else ActorType.VOTER,
            actor_id=current_user.user_id,
            action="VOTE_REJECTED_NO_VOTER_RECORD",
            election_id=election_id,
            audit_status=AuditStatus.FAILURE
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No voter profile associated with this user account"
        )

    voter = db.query(Voter).filter(Voter.voter_id == current_user.voter_id).first()
    if not voter:
        log_audit_event(
            db,
            actor_type=ActorType.VOTER,
            actor_id=current_user.user_id,
            action="VOTE_REJECTED_VOTER_NOT_FOUND",
            election_id=election_id,
            audit_status=AuditStatus.FAILURE
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Voter record not found"
        )

    # 1.5 Biometric verification check (inserted after Auth and before Eligibility)
    biometric_required = os.getenv("BIOMETRIC_VERIFICATION_REQUIRED", "True").lower() == "true"
    if biometric_required:
        if not biometric_token or not verify_biometric_session_token(biometric_token, voter.voter_id):
            log_audit_event(
                db,
                actor_type=ActorType.VOTER,
                actor_id=voter.voter_id,
                action="VOTE_REJECTED_NO_BIOMETRIC",
                election_id=election_id,
                audit_status=AuditStatus.FAILURE
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Biometric verification required for this session before casting a vote"
            )

    # 2. Eligible voter check
    if not voter.eligible or voter.verification_status != VerificationStatus.VERIFIED:
        log_audit_event(
            db,
            actor_type=ActorType.VOTER,
            actor_id=voter.voter_id,
            action="VOTE_REJECTED_INELIGIBLE",
            election_id=election_id,
            audit_status=AuditStatus.FAILURE
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Voter is not eligible or verification status is not VERIFIED"
        )

    # 2.5 Election-specific eligibility validation
    is_eligible = db.query(ElectionEligibility).filter(
        ElectionEligibility.election_id == election_id,
        ElectionEligibility.voter_id == voter.voter_id
    ).first() is not None

    if not is_eligible:
        log_audit_event(
            db,
            actor_type=ActorType.VOTER,
            actor_id=voter.voter_id,
            action="VOTE_REJECTED_NOT_REGISTERED",
            election_id=election_id,
            audit_status=AuditStatus.FAILURE
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Voter is not registered or eligible for this specific election"
        )

    # 3. Election active check
    election = db.query(Election).filter(Election.election_id == election_id).first()
    if not election:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Election not found"
        )

    today = date.today()
    if (
        election.status != ElectionStatus.ACTIVE or
        (election.start_date and today < election.start_date) or
        (election.end_date and today > election.end_date)
    ):
        log_audit_event(
            db,
            actor_type=ActorType.VOTER,
            actor_id=voter.voter_id,
            action="VOTE_REJECTED_ELECTION_INACTIVE",
            election_id=election_id,
            audit_status=AuditStatus.FAILURE
        )
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Election is not active or outside voting timeframe"
        )

    # 4. Already voted check (election-specific participation table)
    existing_participation = db.query(VoterParticipation).filter(
        VoterParticipation.election_id == election_id,
        VoterParticipation.voter_id == voter.voter_id
    ).first()

    if existing_participation:
        log_audit_event(
            db,
            actor_type=ActorType.VOTER,
            actor_id=voter.voter_id,
            action="VOTE_REJECTED_DUPLICATE",
            election_id=election_id,
            audit_status=AuditStatus.FAILURE
        )
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Voter has already cast a vote in this election"
        )

    # 5. Candidate valid check
    candidate = db.query(Candidate).filter(
        Candidate.candidate_id == candidate_id,
        Candidate.election_id == election_id
    ).first()

    if not candidate:
        log_audit_event(
            db,
            actor_type=ActorType.VOTER,
            actor_id=voter.voter_id,
            action="VOTE_REJECTED_INVALID_CANDIDATE",
            election_id=election_id,
            audit_status=AuditStatus.FAILURE
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Candidate is not valid for this election"
        )

    # 6. Record vote & participation inside atomic transaction block
    try:
        participation = VoterParticipation(
            participation_id=f"PT{uuid.uuid4().hex[:8].upper()}",
            voter_id=voter.voter_id,
            election_id=election_id,
            participated_at=datetime.now(timezone.utc)
        )
        db.add(participation)
        db.flush() # Check unique constraint instantly at database level
    except IntegrityError:
        db.rollback()
        log_audit_event(
            db,
            actor_type=ActorType.VOTER,
            actor_id=voter.voter_id,
            action="VOTE_REJECTED_DUPLICATE",
            election_id=election_id,
            audit_status=AuditStatus.FAILURE
        )
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Voter has already cast a vote in this election"
        )

    # Truncate time to nearest hour to preserve vote secrecy (hides correlation)
    now = datetime.now(timezone.utc)
    cast_at_truncated = now.replace(minute=0, second=0, microsecond=0)

    new_vote_id = f"VT{uuid.uuid4().hex[:8].upper()}"
    new_vote = Vote(
        vote_id=new_vote_id,
        election_id=election_id,
        candidate_id=candidate_id,
        cast_at=cast_at_truncated,
        vote_status=VoteStatus.COUNTED
    )
    
    db.add(new_vote)
    db.commit()
    db.refresh(new_vote)

    # Log VOTE_CAST audit log (NO candidate details recorded in audit log)
    log_audit_event(
        db,
        actor_type=ActorType.VOTER,
        actor_id=voter.voter_id,
        action="VOTE_CAST",
        election_id=election_id,
        audit_status=AuditStatus.SUCCESS
    )

    return new_vote
