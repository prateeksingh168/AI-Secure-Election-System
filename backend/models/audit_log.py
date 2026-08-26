import enum
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Enum as SQLEnum, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class ActorType(str, enum.Enum):
    ADMIN = "ADMIN"
    VOTER = "VOTER"
    SYSTEM = "SYSTEM"

class AuditStatus(str, enum.Enum):
    SUCCESS = "SUCCESS"
    FAILURE = "FAILURE"

class AuditLog(Base):
    __tablename__ = "audit_logs"

    log_id = Column(String, primary_key=True, index=True)
    actor_type = Column(SQLEnum(ActorType), nullable=False)
    actor_id = Column(String, nullable=False)
    action = Column(String, nullable=False)
    election_id = Column(String, ForeignKey("elections.election_id"), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    status = Column(SQLEnum(AuditStatus), default=AuditStatus.SUCCESS, nullable=False)

    # Relationships
    election = relationship("Election", back_populates="audit_logs")
