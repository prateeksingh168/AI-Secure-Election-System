from typing import Optional
from pydantic import BaseModel, ConfigDict
from models.user import UserRole, UserStatus

class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    role: UserRole
    name: str

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_id: str
    voter_id: Optional[str] = None
    name: str
    email: str
    role: UserRole
    status: UserStatus
