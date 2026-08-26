from sqlalchemy import Column, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Candidate(Base):
    __tablename__ = "candidates"

    candidate_id = Column(String, primary_key=True, index=True)
    election_id = Column(String, ForeignKey("elections.election_id"), nullable=False)
    name = Column(String, nullable=False)
    department = Column(String, nullable=False)
    symbol = Column(String, nullable=False)
    manifesto = Column(Text, nullable=True)

    # Relationships
    election = relationship("Election", back_populates="candidates")
    votes = relationship("Vote", back_populates="candidate", cascade="all, delete-orphan")
