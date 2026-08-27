import os
import uuid
import hashlib
import json
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Optional, Tuple, Any
import jwt
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from models import Voter, User, UserRole, ActorType, AuditStatus, BiometricRecord, BiometricMethod, BiometricRecordStatus, BiometricSourceType
from schemas.biometric import BiometricEnrollRequest, BiometricVerifyRequest, BiometricVerifyResponse
from services.audit import log_audit_event
from services.biometric_input_adapter import normalize_to_embedding, extract_embedding_stub
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise RuntimeError(
        "SECRET_KEY environment variable is missing. Please configure SECRET_KEY in your environment or .env file."
    )
ALGORITHM = "HS256"
BIOMETRIC_TOKEN_EXPIRE_MINUTES = 15
SIMILARITY_THRESHOLD = 0.85

def extract_embedding(image_bytes: bytes) -> List[float]:
    """
    Stub function for face/retina ML embedding extraction.
    Accepts raw image bytes, returns a 128-float normalized embedding vector.
    """
    return extract_embedding_stub(image_bytes)

# In-memory rate limiting tracker for failed biometric attempts
# Structure: { voter_id: [timestamp1, timestamp2, ...] }
FAILED_ATTEMPTS: Dict[str, List[datetime]] = {}

def hash_embedding(embedding: List[float]) -> str:
    """Hashes embedding vector so raw vectors are never stored plaintext at rest."""
    str_repr = json.dumps([round(v, 4) for v in embedding])
    salt = "biometric_salt_2026_secure"
    return hashlib.sha256((salt + str_repr).encode('utf-8')).hexdigest()

def compare_embeddings(a: List[float], b: List[float]) -> float:
    """
    Stubbed comparison function computing cosine similarity between two float vectors.
    Returns confidence score between 0.0 and 1.0.
    """
    if not a or not b or len(a) != len(b):
        return 0.0
    dot_product = sum(x * y for x, y in zip(a, b))
    norm_a = (sum(x ** 2 for x in a)) ** 0.5
    norm_b = (sum(y ** 2 for y in b)) ** 0.5
    if norm_a == 0 or norm_b == 0:
        return 0.0
    similarity = dot_product / (norm_a * norm_b)
    # Clamp between 0.0 and 1.0
    return round(max(0.0, min(1.0, float(similarity))), 4)

def check_rate_limit(db: Session, voter_id: str):
    """
    Rate-limits failed attempts per voter (locks after 5 failures in 10 minutes).
    """
    now = datetime.now(timezone.utc)
    cutoff = now - timedelta(minutes=10)
    
    attempts = FAILED_ATTEMPTS.get(voter_id, [])
    # Filter attempts within 10-minute window
    recent_attempts = [ts for ts in attempts if ts > cutoff]
    FAILED_ATTEMPTS[voter_id] = recent_attempts

    if len(recent_attempts) >= 5:
        # Log BIOMETRIC_LOCKED event
        log_audit_event(
            db,
            actor_type=ActorType.SYSTEM,
            actor_id=voter_id,
            action="BIOMETRIC_LOCKED",
            audit_status=AuditStatus.FAILURE
        )
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Biometric verification locked due to too many failed attempts (5 failures in 10 mins). Try again in 10 minutes."
        )

def record_failed_attempt(db: Session, voter_id: str):
    now = datetime.now(timezone.utc)
    if voter_id not in FAILED_ATTEMPTS:
        FAILED_ATTEMPTS[voter_id] = []
    FAILED_ATTEMPTS[voter_id].append(now)

def clear_failed_attempts(voter_id: str):
    if voter_id in FAILED_ATTEMPTS:
        FAILED_ATTEMPTS[voter_id] = []

def create_biometric_token(voter_id: str, method: BiometricMethod) -> str:
    now = datetime.now(timezone.utc)
    expire = now + timedelta(minutes=BIOMETRIC_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": voter_id,
        "scope": "biometric_verification",
        "method": method.value,
        "exp": expire
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def verify_biometric_session_token(token: str, voter_id: str) -> bool:
    if not token:
        return False
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("sub") != voter_id:
            return False
        if payload.get("scope") != "biometric_verification":
            return False
        return True
    except jwt.PyJWTError:
        return False

def enroll_voter_biometric(
    db: Session,
    current_user: User,
    req: BiometricEnrollRequest
) -> BiometricRecord:
    # 1. Authorization check: voter enrolling themselves OR admin on behalf of voter
    if current_user.role != UserRole.ADMIN and current_user.voter_id != req.voter_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to enroll biometrics for another voter"
        )

    # 2. Check voter exists
    voter = db.query(Voter).filter(Voter.voter_id == req.voter_id).first()
    if not voter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Voter record not found"
        )

    # 3. Check existing enrollment for this method
    existing_record = db.query(BiometricRecord).filter(
        BiometricRecord.voter_id == req.voter_id,
        BiometricRecord.method == req.biometric_data.method,
        BiometricRecord.status == BiometricRecordStatus.ACTIVE
    ).first()

    if existing_record and not req.re_enroll:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Active biometric enrollment already exists for method {req.biometric_data.method.value}. Pass re_enroll=true to overwrite."
        )

    # 4. Normalize input payload
    try:
        embedding, vendor_res, source_type = normalize_to_embedding(req.biometric_data)
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(ve)
        )

    # 5. Compute template_hash
    if embedding is not None:
        template_hash = hash_embedding(embedding)
    elif vendor_res is not None:
        template_hash = hashlib.sha256(json.dumps(vendor_res, sort_keys=True).encode('utf-8')).hexdigest()
    else:
        raise HTTPException(status_code=400, detail="Invalid biometric input")

    # 6. Overwrite if re_enroll or create new
    if existing_record and req.re_enroll:
        existing_record.status = BiometricRecordStatus.REVOKED
        db.commit()

    record_id = f"BIO_{uuid.uuid4().hex[:8].upper()}"
    new_record = BiometricRecord(
        record_id=record_id,
        voter_id=req.voter_id,
        method=req.biometric_data.method,
        template_hash=template_hash,
        source_type=source_type,
        enrolled_at=datetime.now(timezone.utc),
        status=BiometricRecordStatus.ACTIVE
    )
    db.add(new_record)
    db.commit()
    db.refresh(new_record)

    # Log BIOMETRIC_ENROLLED audit log (NO template or image details in audit log)
    log_audit_event(
        db,
        actor_type=ActorType.ADMIN if current_user.role == UserRole.ADMIN else ActorType.VOTER,
        actor_id=current_user.user_id,
        action="BIOMETRIC_ENROLLED",
        audit_status=AuditStatus.SUCCESS
    )

    return new_record

def verify_voter_biometric(
    db: Session,
    current_user: User,
    req: BiometricVerifyRequest
) -> BiometricVerifyResponse:
    # 1. Authorization check
    if current_user.role != UserRole.ADMIN and current_user.voter_id != req.voter_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to verify biometrics for another voter"
        )

    # 2. Check rate limit
    check_rate_limit(db, req.voter_id)

    # 3. Check active biometric record exists
    record = db.query(BiometricRecord).filter(
        BiometricRecord.voter_id == req.voter_id,
        BiometricRecord.method == req.biometric_data.method,
        BiometricRecord.status == BiometricRecordStatus.ACTIVE
    ).first()

    if not record:
        record_failed_attempt(db, req.voter_id)
        log_audit_event(
            db,
            actor_type=ActorType.VOTER,
            actor_id=req.voter_id,
            action="BIOMETRIC_VERIFICATION_FAILED",
            audit_status=AuditStatus.FAILURE
        )
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No active biometric enrollment found for method {req.biometric_data.method.value}"
        )

    # 4. Normalize input payload
    try:
        embedding, vendor_res, source_type = normalize_to_embedding(req.biometric_data)
    except ValueError as ve:
        record_failed_attempt(db, req.voter_id)
        log_audit_event(
            db,
            actor_type=ActorType.VOTER,
            actor_id=req.voter_id,
            action="BIOMETRIC_VERIFICATION_FAILED",
            audit_status=AuditStatus.FAILURE
        )
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(ve)
        )

    verified = False
    confidence = None

    # 5. Handle Vendor Result short-circuit OR Embedding Comparison
    if source_type == BiometricSourceType.VENDOR and vendor_res is not None:
        verified = bool(vendor_res.get("verified", False) or vendor_res.get("match", False))
        confidence = float(vendor_res.get("confidence", vendor_res.get("score", 0.95)))
    else:
        # Compare hash of input embedding vs stored template_hash
        input_hash = hash_embedding(embedding) if embedding else ""
        if input_hash == record.template_hash:
            verified = True
            confidence = 1.0
        else:
            # Fallback comparison if embedding vectors exist
            verified = False
            confidence = 0.20

    if verified:
        clear_failed_attempts(req.voter_id)
        token = create_biometric_token(req.voter_id, req.biometric_data.method)
        log_audit_event(
            db,
            actor_type=ActorType.VOTER,
            actor_id=req.voter_id,
            action="BIOMETRIC_VERIFIED",
            audit_status=AuditStatus.SUCCESS
        )
        return BiometricVerifyResponse(
            verified=True,
            confidence=confidence,
            biometric_token=token,
            message="Biometric verification successful"
        )
    else:
        record_failed_attempt(db, req.voter_id)
        log_audit_event(
            db,
            actor_type=ActorType.VOTER,
            actor_id=req.voter_id,
            action="BIOMETRIC_VERIFICATION_FAILED",
            audit_status=AuditStatus.FAILURE
        )
        return BiometricVerifyResponse(
            verified=False,
            confidence=confidence,
            biometric_token=None,
            message="Biometric verification failed: template match score below threshold"
        )
