from services.auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
    require_admin,
    require_voter
)
from services.audit import log_audit_event
from services.voting import process_vote_casting
from services.biometric_input_adapter import normalize_to_embedding
from services.biometric_service import (
    extract_embedding,
    compare_embeddings,
    hash_embedding,
    enroll_voter_biometric,
    verify_voter_biometric,
    verify_biometric_session_token
)

__all__ = [
    "hash_password",
    "verify_password",
    "create_access_token",
    "get_current_user",
    "require_admin",
    "require_voter",
    "log_audit_event",
    "process_vote_casting",
    "normalize_to_embedding",
    "extract_embedding",
    "compare_embeddings",
    "hash_embedding",
    "enroll_voter_biometric",
    "verify_voter_biometric",
    "verify_biometric_session_token",
]
