import enum
from sqlalchemy import Column, String, Enum as SQLEnum, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class UserRole(str, enum.Enum):
    VOTER = "VOTER"
    ADMIN = "ADMIN"

class UserStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    SUSPENDED = "SUSPENDED"

class User(Base):
    __tablename__ = "users"

    user_id = Column(String, primary_key=True, index=True)
    voter_id = Column(String, ForeignKey("voters.voter_id"), nullable=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(SQLEnum(UserRole), default=UserRole.VOTER, nullable=False)
    status = Column(SQLEnum(UserStatus), default=UserStatus.ACTIVE, nullable=False)

    # Relationships
    voter = relationship("Voter", back_populates="user", uselist=False)
