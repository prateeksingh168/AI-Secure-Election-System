import enum
from sqlalchemy import Column, String, Boolean, Enum as SQLEnum
from sqlalchemy.orm import relationship
from database import Base

class VerificationStatus(str, enum.Enum):
    VERIFIED = "VERIFIED"
    PENDING = "PENDING"
    REJECTED = "REJECTED"

class Voter(Base):
    __tablename__ = "voters"

    voter_id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    eligible = Column(Boolean, default=True, nullable=False)
    verification_status = Column(SQLEnum(VerificationStatus), default=VerificationStatus.PENDING, nullable=False)
    has_voted = Column(Boolean, default=False, nullable=False)
    role = Column(String, default="VOTER", nullable=False)

    # Relationships
    user = relationship("User", back_populates="voter", uselist=False)
    votes = relationship("Vote", back_populates="voter")
