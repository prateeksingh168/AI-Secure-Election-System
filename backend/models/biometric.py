import enum
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Enum as SQLEnum, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from database import Base

class BiometricMethod(str, enum.Enum):
    FACE = "FACE"
    RETINA = "RETINA"

class BiometricSourceType(str, enum.Enum):
    EMBEDDING = "EMBEDDING"
    IMAGE_DERIVED = "IMAGE_DERIVED"
    VENDOR = "VENDOR"

class BiometricRecordStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    REVOKED = "REVOKED"

class BiometricRecord(Base):
    __tablename__ = "biometric_records"

    record_id = Column(String, primary_key=True, index=True)
    voter_id = Column(String, ForeignKey("voters.voter_id"), nullable=False)
    method = Column(SQLEnum(BiometricMethod), nullable=False)
    template_hash = Column(String, nullable=False)
    source_type = Column(SQLEnum(BiometricSourceType), nullable=False)
    enrolled_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    status = Column(SQLEnum(BiometricRecordStatus), default=BiometricRecordStatus.ACTIVE, nullable=False)

    __table_args__ = (
        UniqueConstraint("voter_id", "method", name="uq_voter_biometric_method"),
    )

    # Relationships
    voter = relationship("Voter")
