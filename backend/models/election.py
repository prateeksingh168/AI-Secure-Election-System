import enum
from sqlalchemy import Column, String, Text, Date, Enum as SQLEnum
from sqlalchemy.orm import relationship
from database import Base

class ElectionStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    ACTIVE = "ACTIVE"
    CLOSED = "CLOSED"

class Election(Base):
    __tablename__ = "elections"

    election_id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    status = Column(SQLEnum(ElectionStatus), default=ElectionStatus.DRAFT, nullable=False)
    rules_version = Column(String, default="1.0", nullable=False)

    # Relationships
    candidates = relationship("Candidate", back_populates="election", cascade="all, delete-orphan")
    votes = relationship("Vote", back_populates="election", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="election")
