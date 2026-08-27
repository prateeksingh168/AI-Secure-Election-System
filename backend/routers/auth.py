from typing import Optional, Tuple
from fastapi import APIRouter, Depends, HTTPException, status, Request, Form
from sqlalchemy.orm import Session
from database import get_db
from models import User, ActorType, AuditStatus
from schemas import TokenResponse, UserResponse
from services import verify_password, create_access_token, get_current_user, log_audit_event

router = APIRouter(prefix="/auth", tags=["Auth"])

async def extract_credentials(
    request: Request,
    username: Optional[str] = Form(None),
    password: Optional[str] = Form(None)
) -> Tuple[Optional[str], Optional[str]]:
    if username and password:
        return username, password
    
    try:
        body = await request.json()
        email = body.get("email") or body.get("username")
        pwd = body.get("password")
        return email, pwd
    except Exception:
        return username, password

@router.post("/login", response_model=TokenResponse)
async def login(
    creds: Tuple[Optional[str], Optional[str]] = Depends(extract_credentials),
    db: Session = Depends(get_db)
):
    email, password = creds

    if not email or not password:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="Email (username) and password are required"
        )

    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.password_hash):
        if user:
            log_audit_event(
                db,
                actor_type=ActorType.ADMIN if str(user.role).upper() == "ADMIN" else ActorType.VOTER,
                actor_id=user.user_id,
                action="LOGIN_FAILED",
                audit_status=AuditStatus.FAILURE
            )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"}
        )

    # Log successful login audit event
    actor_type = ActorType.ADMIN if str(user.role).upper() == "ADMIN" else ActorType.VOTER
    log_audit_event(
        db,
        actor_type=actor_type,
        actor_id=user.user_id,
        action="LOGIN",
        audit_status=AuditStatus.SUCCESS
    )

    return create_access_token(user)

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
