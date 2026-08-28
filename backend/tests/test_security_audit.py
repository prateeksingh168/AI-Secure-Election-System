import os
import pytest
from datetime import date, timedelta, datetime, timezone
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Setup test environment before imports
os.environ["SECRET_KEY"] = "test-secret-key-for-pytest-execution-only-2026"
os.environ["DATABASE_URL"] = "sqlite:///./test_security_audit.db"
os.environ["BIOMETRIC_VERIFICATION_REQUIRED"] = "True"

from main import app
from database import Base, engine, SessionLocal, get_db
from models import (
    User, UserRole, UserStatus, Voter, VerificationStatus,
    Election, ElectionStatus, Candidate, Vote, VoterParticipation,
    ElectionEligibility, BiometricRecord, BiometricMethod,
    BiometricRecordStatus, BiometricSourceType, BiometricAttempt
)
from services.auth import hash_password
from services.biometric_service import check_rate_limit, record_failed_attempt, clear_failed_attempts

def override_get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_audit_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # Create baseline admin
    admin_voter = Voter(
        voter_id="V_ADM",
        name="Admin User",
        email="admin_audit@demo-election.local",
        eligible=True,
        verification_status=VerificationStatus.VERIFIED,
        role="VOTER"
    )
    admin_user = User(
        user_id="U_ADM",
        voter_id="V_ADM",
        name="Admin User",
        email="admin_audit@demo-election.local",
        password_hash=hash_password("password123"),
        role=UserRole.ADMIN,
        status=UserStatus.ACTIVE
    )
    
    # Create test voters
    voters = []
    users = []
    for i in range(1, 6):
        vid = f"V_T{i}"
        uid = f"U_T{i}"
        v = Voter(
            voter_id=vid,
            name=f"Test Voter {i}",
            email=f"voter{i}@audit.local",
            eligible=True,
            verification_status=VerificationStatus.VERIFIED,
            role="VOTER"
        )
        u = User(
            user_id=uid,
            voter_id=vid,
            name=f"Test Voter {i}",
            email=f"voter{i}@audit.local",
            password_hash=hash_password("password123"),
            role=UserRole.VOTER,
            status=UserStatus.ACTIVE
        )
        voters.append(v)
        users.append(u)
        
    db.add(admin_voter)
    db.add(admin_user)
    for v in voters:
        db.add(v)
    for u in users:
        db.add(u)
        
    # Create two different elections representing different groups
    el_a = Election(
        election_id="E_GRP_A",
        title="Group A Election",
        description="CS Department Representatives",
        start_date=date.today() - timedelta(days=1),
        end_date=date.today() + timedelta(days=2),
        status=ElectionStatus.ACTIVE,
        rules_version="1.0"
    )
    el_b = Election(
        election_id="E_GRP_B",
        title="Group B Election",
        description="ECE Department Representatives",
        start_date=date.today() - timedelta(days=1),
        end_date=date.today() + timedelta(days=2),
        status=ElectionStatus.ACTIVE,
        rules_version="1.0"
    )
    db.add(el_a)
    db.add(el_b)
    
    # Create Candidates
    cand_a = Candidate(
        candidate_id="C_A1",
        election_id="E_GRP_A",
        name="Candidate GRP A1",
        department="CS",
        symbol="✊",
        manifesto="Vision A"
    )
    cand_b = Candidate(
        candidate_id="C_B1",
        election_id="E_GRP_B",
        name="Candidate GRP B1",
        department="ECE",
        symbol="🛡️",
        manifesto="Vision B"
    )
    db.add(cand_a)
    db.add(cand_b)
    
    # Map Eligibility:
    # E_GRP_A -> V_T1, V_T2 (2 voters)
    # E_GRP_B -> V_T3, V_T4, V_T5 (3 voters)
    db.add(ElectionEligibility(election_id="E_GRP_A", voter_id="V_T1"))
    db.add(ElectionEligibility(election_id="E_GRP_A", voter_id="V_T2"))
    
    db.add(ElectionEligibility(election_id="E_GRP_B", voter_id="V_T3"))
    db.add(ElectionEligibility(election_id="E_GRP_B", voter_id="V_T4"))
    db.add(ElectionEligibility(election_id="E_GRP_B", voter_id="V_T5"))
    
    # Map mock biometric enrollment for V_T1 so they can verification-test
    bio_rec = BiometricRecord(
        record_id="BIO_T1",
        voter_id="V_T1",
        method=BiometricMethod.FACE,
        template_hash="61eb986348efc63c8aef1638a16223e7f6a22f36f61efd62be28ee2",
        source_type=BiometricSourceType.EMBEDDING,
        status=BiometricRecordStatus.ACTIVE
    )
    db.add(bio_rec)
    
    db.commit()
    db.close()
    
    yield
    
    # Tear down
    Base.metadata.drop_all(bind=engine)
    engine.dispose()
    if os.path.exists("test_security_audit.db"):
        try:
            os.remove("test_security_audit.db")
        except PermissionError:
            pass

def get_auth_headers(email: str) -> dict:
    login_res = client.post("/auth/login", json={"email": email, "password": "password123"})
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

# 1. TEST TRUE BALLOT ANONYMITY (NO voter_id in votes table)
def test_database_vote_anonymity():
    db = SessionLocal()
    # Cast a vote for V_T1
    headers = get_auth_headers("voter1@audit.local")
    
    # Temporarily set biometric bypass to skip face webcam captures in pytest
    os.environ["BIOMETRIC_VERIFICATION_REQUIRED"] = "False"
    
    vote_res = client.post("/elections/E_GRP_A/vote", json={"candidate_id": "C_A1"}, headers=headers)
    assert vote_res.status_code == 201
    
    # Retrieve all rows in votes table
    db_votes = db.query(Vote).all()
    assert len(db_votes) > 0
    
    for vote in db_votes:
        # DB-level check: assert voter_id is NOT a column/attribute of Vote model
        assert not hasattr(vote, "voter_id")
        
        # Verify hour-level truncation of cast_at timestamp
        assert vote.cast_at.minute == 0
        assert vote.cast_at.second == 0
        
    # Check VoterParticipation tracks participation
    participation = db.query(VoterParticipation).filter(
        VoterParticipation.voter_id == "V_T1",
        VoterParticipation.election_id == "E_GRP_A"
    ).first()
    assert participation is not None
    db.close()

# 2. TEST PERSISTENT Lockout Rate Limit across database sessions
def test_persistent_failed_attempts_lockout():
    db = SessionLocal()
    vid = "V_T2"
    
    # Clear previous attempts
    clear_failed_attempts(db, vid)
    
    # Simulate 5 failed biometric attempts
    for _ in range(5):
        record_failed_attempt(db, vid)
        
    # Verify rate limit triggers
    with pytest.raises(Exception) as exc_info:
        check_rate_limit(db, vid)
    
    # Close session (simulating application/session termination)
    db.close()
    
    # Re-open a fresh session (restart simulation)
    db_new = SessionLocal()
    
    # Verify rate limit is STILL triggered (survived app restart!)
    with pytest.raises(Exception) as exc_info_new:
        check_rate_limit(db_new, vid)
        
    assert "locked" in str(exc_info_new.value.detail).lower()
    
    # Reset/Clear attempts and verify it allows checks again
    clear_failed_attempts(db_new, vid)
    check_rate_limit(db_new, vid) # Should not raise exception
    
    db_new.close()

# 3. TEST ELECTION-SPECIFIC TURNOUT CALCULATIONS
def test_group_turnout_metrics():
    # Set biometric verify bypass
    os.environ["BIOMETRIC_VERIFICATION_REQUIRED"] = "False"
    
    # E_GRP_A: 2 eligible. V_T1 has voted. V_T2 has not. Turnout: 50%
    headers_adm = get_auth_headers("admin_audit@demo-election.local")
    res_a = client.get("/elections/E_GRP_A/results", headers=headers_adm)
    assert res_a.status_code == 200
    data_a = res_a.json()
    assert data_a["total_eligible_voters"] == 2
    assert data_a["total_votes_cast"] == 1
    assert data_a["turnout_percentage"] == 50.0
    
    # E_GRP_B: 3 eligible. Cast 2 votes (V_T3 and V_T4)
    h_v3 = get_auth_headers("voter3@audit.local")
    h_v4 = get_auth_headers("voter4@audit.local")
    
    v3_res = client.post("/elections/E_GRP_B/vote", json={"candidate_id": "C_B1"}, headers=h_v3)
    assert v3_res.status_code == 201
    v4_res = client.post("/elections/E_GRP_B/vote", json={"candidate_id": "C_B1"}, headers=h_v4)
    assert v4_res.status_code == 201
    
    # E_GRP_B results -> Turnout should be 66.67% (2/3)
    res_b = client.get("/elections/E_GRP_B/results", headers=headers_adm)
    assert res_b.status_code == 200
    data_b = res_b.json()
    assert data_b["total_eligible_voters"] == 3
    assert data_b["total_votes_cast"] == 2
    assert data_b["turnout_percentage"] == 66.67

# 4. TEST AI ROUTER ACCESS CONTROL & DISPATCH VALIDATIONS
def test_ai_router_access_control():
    # voter3 is registered for E_GRP_B, NOT eligible for E_GRP_A
    h_v3 = get_auth_headers("voter3@audit.local")
    
    # Request E_GRP_A (should fail 403 Forbidden!)
    res_forbidden = client.get("/ai/context/E_GRP_A", headers=h_v3)
    assert res_forbidden.status_code == 403
    assert "not registered" in res_forbidden.json()["detail"].lower()
    
    # Request E_GRP_B (should succeed 200 OK!)
    res_success = client.get("/ai/context/E_GRP_B", headers=h_v3)
    assert res_success.status_code == 200
    data = res_success.json()
    assert data["election_id"] == "E_GRP_B"
    assert data["turnout"]["total_eligible_voters"] == 3
