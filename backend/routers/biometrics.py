from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from database import get_db
from models import User
from schemas.biometric import BiometricEnrollRequest, BiometricVerifyRequest, BiometricVerifyResponse
from services import get_current_user, enroll_voter_biometric, verify_voter_biometric

router = APIRouter(prefix="/biometrics", tags=["Biometrics"])

@router.post("/enroll", status_code=status.HTTP_201_CREATED)
def enroll_biometric(
    req: BiometricEnrollRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    record = enroll_voter_biometric(db, current_user, req)
    return {
        "record_id": record.record_id,
        "voter_id": record.voter_id,
        "method": record.method.value,
        "source_type": record.source_type.value,
        "status": record.status.value,
        "message": "Biometric record enrolled successfully"
    }

@router.post("/verify", response_model=BiometricVerifyResponse)
def verify_biometric(
    req: BiometricVerifyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return verify_voter_biometric(db, current_user, req)
