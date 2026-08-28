from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class ElectionEligibility(Base):
    __tablename__ = "election_eligibility"

    election_id = Column(String, ForeignKey("elections.election_id", ondelete="CASCADE"), primary_key=True)
    voter_id = Column(String, ForeignKey("voters.voter_id", ondelete="CASCADE"), primary_key=True)

    # Relationships
    election = relationship("Election")
    voter = relationship("Voter")
