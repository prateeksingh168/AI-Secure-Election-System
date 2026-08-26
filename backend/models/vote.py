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
    election_id = Column(String, ForeignKey("elections.election_id"), nullable=False)
    candidate_id = Column(String, ForeignKey("candidates.candidate_id"), nullable=False)
    voter_id = Column(String, ForeignKey("voters.voter_id"), nullable=True)
    cast_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    vote_status = Column(SQLEnum(VoteStatus), default=VoteStatus.COUNTED, nullable=False)

    __table_args__ = (
        UniqueConstraint("election_id", "voter_id", name="uq_election_voter"),
    )

    # Relationships
    election = relationship("Election", back_populates="votes")
    candidate = relationship("Candidate", back_populates="votes")
    voter = relationship("Voter", back_populates="votes")
