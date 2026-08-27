import os
import base64
import pytest
from datetime import date, timedelta
from fastapi.testclient import TestClient

os.environ["BIOMETRIC_VERIFICATION_REQUIRED"] = "True"

from main import app
from database import Base, engine, SessionLocal, get_db
from seed import seed_database
from models import Election, BiometricRecord

def override_get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="module", autouse=True)
def setup_test_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    seed_database(db)
    
    election = db.query(Election).filter(Election.election_id == "E001").first()
    if election:
        election.start_date = date.today() - timedelta(days=1)
        election.end_date = date.today() + timedelta(days=2)
        db.commit()

    db.close()
    yield

client = TestClient(app)

def get_voter1_token():
    login_res = client.post(
        "/auth/login",
        json={"email": "voter001@demo-election.local", "password": "password123"}
    )
    return login_res.json()["access_token"]

# 1. ENROLL & VERIFY WITH EMBEDDING
def test_biometric_enroll_and_verify_embedding():
    token = get_voter1_token()
    headers = {"Authorization": f"Bearer {token}"}
    dummy_vector = [0.1, 0.2, 0.3, 0.4, 0.5]

    # Enroll
    enroll_res = client.post(
        "/biometrics/enroll",
        json={
            "voter_id": "V001",
            "biometric_data": {
                "method": "FACE",
                "embedding": dummy_vector
            }
        },
        headers=headers
    )
    assert enroll_res.status_code == 201
    assert enroll_res.json()["source_type"] == "EMBEDDING"

    # Verify Success
    verify_res = client.post(
        "/biometrics/verify",
        json={
            "voter_id": "V001",
            "biometric_data": {
                "method": "FACE",
                "embedding": dummy_vector
            }
        },
        headers=headers
    )
    assert verify_res.status_code == 200
    assert verify_res.json()["verified"] is True
    assert verify_res.json()["biometric_token"] is not None

# 2. DUPLICATE ENROLLMENT REJECTION
def test_duplicate_enrollment_rejection():
    token = get_voter1_token()
    headers = {"Authorization": f"Bearer {token}"}

    enroll_res = client.post(
        "/biometrics/enroll",
        json={
            "voter_id": "V001",
            "biometric_data": {
                "method": "FACE",
                "embedding": [0.1, 0.2, 0.3, 0.4, 0.5]
            }
        },
        headers=headers
    )
    assert enroll_res.status_code == 409

# 3. ENROLL & VERIFY WITH IMAGE_BASE64
def test_biometric_enroll_and_verify_image_base64():
    token = get_voter1_token()
    headers = {"Authorization": f"Bearer {token}"}
    sample_b64 = base64.b64encode(b"dummy_sample_retina_image_bytes_2026").decode('utf-8')

    # Enroll Retina with Image Base64
    enroll_res = client.post(
        "/biometrics/enroll",
        json={
            "voter_id": "V001",
            "biometric_data": {
                "method": "RETINA",
                "image_base64": sample_b64
            }
        },
        headers=headers
    )
    assert enroll_res.status_code == 201
    assert enroll_res.json()["source_type"] == "IMAGE_DERIVED"

    # Verify Success
    verify_res = client.post(
        "/biometrics/verify",
        json={
            "voter_id": "V001",
            "biometric_data": {
                "method": "RETINA",
                "image_base64": sample_b64
            }
        },
        headers=headers
    )
    assert verify_res.status_code == 200
    assert verify_res.json()["verified"] is True

# 4. ENROLL & VERIFY WITH VENDOR_RESULT
def test_biometric_enroll_and_verify_vendor_result():
    # Login as voter002
    login_res = client.post(
        "/auth/login",
        json={"email": "voter002@demo-election.local", "password": "password123"}
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    vendor_payload = {"vendor_name": "SecureFaceSDK", "match": True, "score": 0.98}

    # Enroll
    enroll_res = client.post(
        "/biometrics/enroll",
        json={
            "voter_id": "V002",
            "biometric_data": {
                "method": "FACE",
                "vendor_result": vendor_payload
            }
        },
        headers=headers
    )
    assert enroll_res.status_code == 201
    assert enroll_res.json()["source_type"] == "VENDOR"

    # Verify
    verify_res = client.post(
        "/biometrics/verify",
        json={
            "voter_id": "V002",
            "biometric_data": {
                "method": "FACE",
                "vendor_result": vendor_payload
            }
        },
        headers=headers
    )
    assert verify_res.status_code == 200
    assert verify_res.json()["verified"] is True

# 5. MALFORMED / MULTIPLE INPUT PAYLOAD VALIDATION REJECTION
def test_malformed_input_payload():
    token = get_voter1_token()
    headers = {"Authorization": f"Bearer {token}"}

    # Sending both embedding AND image_base64 (invalid)
    res = client.post(
        "/biometrics/enroll",
        json={
            "voter_id": "V001",
            "biometric_data": {
                "method": "FACE",
                "embedding": [0.1, 0.2],
                "image_base64": "abc"
            }
        },
        headers=headers
    )
    assert res.status_code == 422

# 6. VERIFY WITH NO ENROLLMENT
def test_verify_no_enrollment():
    login_res = client.post(
        "/auth/login",
        json={"email": "voter003@demo-election.local", "password": "password123"}
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = client.post(
        "/biometrics/verify",
        json={
            "voter_id": "V003",
            "biometric_data": {
                "method": "FACE",
                "embedding": [0.1, 0.2, 0.3]
            }
        },
        headers=headers
    )
    assert res.status_code == 404

# 7. VOTING BLOCKED WITHOUT BIOMETRIC TOKEN & ALLOWED WITH BIOMETRIC TOKEN
def test_voting_biometric_validation_chain():
    os.environ["BIOMETRIC_VERIFICATION_REQUIRED"] = "True"
    # Login as voter002
    login_res = client.post(
        "/auth/login",
        json={"email": "voter002@demo-election.local", "password": "password123"}
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Attempt vote without biometric_token -> Rejected 403
    vote_fail = client.post(
        "/elections/E001/vote",
        json={"candidate_id": "C001"},
        headers=headers
    )
    assert vote_fail.status_code == 403
    assert "biometric" in vote_fail.json()["detail"].lower()

    # 2. Perform successful biometric verification -> get biometric_token
    verify_res = client.post(
        "/biometrics/verify",
        json={
            "voter_id": "V002",
            "biometric_data": {
                "method": "FACE",
                "vendor_result": {"match": True, "score": 0.99}
            }
        },
        headers=headers
    )
    bio_token = verify_res.json()["biometric_token"]
    assert bio_token is not None

    # 3. Attempt vote WITH biometric_token -> Success 201
    vote_success = client.post(
        "/elections/E001/vote",
        json={"candidate_id": "C001", "biometric_token": bio_token},
        headers=headers
    )
    assert vote_success.status_code == 201
    assert vote_success.json()["vote_status"] == "COUNTED"

# 8. PRIVACY AUDIT CHECK
def test_biometric_privacy():
    login_res = client.post("/auth/login", json={"email": "admin@demo-election.local", "password": "password123"})
    token = login_res.json()["access_token"]
    
    logs_res = client.get("/audit-logs", headers={"Authorization": f"Bearer {token}"})
    assert logs_res.status_code == 200
    logs = logs_res.json()

    for log in logs:
        # Verify no raw embeddings, images, or template hashes appear in audit log text
        assert "dummy_sample" not in log["action"]
        assert "[" not in log["action"]
