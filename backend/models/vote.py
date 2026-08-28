import enum
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Enum as SQLEnum, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from database import Base

class VoteStatus(str, enum.Enum):
    COUNTED = "COUNTED"
    REJECTED = "REJECTED"

class Vote(Base):
    __tablename__ = "votes"

    vote_id = Column(String, primary_key=True, index=True)
    election_id = Column(String, ForeignKey("elections.election_id", ondelete="CASCADE"), nullable=False)
    candidate_id = Column(String, ForeignKey("candidates.candidate_id", ondelete="CASCADE"), nullable=False)
    cast_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    vote_status = Column(SQLEnum(VoteStatus), default=VoteStatus.COUNTED, nullable=False)

    # Relationships (Anonymous - NO voter link)
    election = relationship("Election", back_populates="votes")
    candidate = relationship("Candidate", back_populates="votes")

class VoterParticipation(Base):
    __tablename__ = "voter_participation"

    participation_id = Column(String, primary_key=True, index=True)
    voter_id = Column(String, ForeignKey("voters.voter_id", ondelete="CASCADE"), nullable=False)
    election_id = Column(String, ForeignKey("elections.election_id", ondelete="CASCADE"), nullable=False)
    participated_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        UniqueConstraint("voter_id", "election_id", name="uq_voter_election_participation"),
    )

    # Relationships
    voter = relationship("Voter", back_populates="participations")
    election = relationship("Election")
