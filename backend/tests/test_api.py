import os
from datetime import date, timedelta
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Set test environment
os.environ["DATABASE_URL"] = "sqlite:///./test_election.db"

from main import app
from database import Base, get_db
from seed import seed_database
from models import User, UserRole, UserStatus, Voter, VerificationStatus, Election, ElectionStatus

SQLALCHEMY_DATABASE_URL = "sqlite:///./test_election.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="module", autouse=True)
def setup_test_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    seed_database(db)
    
    # 1. Update E001 active election dates for current date
    election = db.query(Election).filter(Election.election_id == "E001").first()
    if election:
        election.start_date = date.today() - timedelta(days=1)
        election.end_date = date.today() + timedelta(days=2)
    
    # 2. Add an ineligible voter for testing (V998)
    ineligible_voter = Voter(
        voter_id="V998",
        name="Ineligible User",
        email="ineligible@demo-election.local",
        eligible=False,
        verification_status=VerificationStatus.VERIFIED,
        has_voted=False,
        role="VOTER"
    )
    ineligible_user = User(
        user_id="U998",
        voter_id="V998",
        name="Ineligible User",
        email="ineligible@demo-election.local",
        password_hash="$2b$12$e/aA4v0J871gA3dK2rJ9O.O0rK4pM1zJ9O.O0rK4pM1zJ9O.O0rK4", # "password123"
        role=UserRole.VOTER,
        status=UserStatus.ACTIVE
    )
    from services.auth import hash_password
    ineligible_user.password_hash = hash_password("password123")
    
    # 3. Add an unverified voter for testing (V999)
    unverified_voter = Voter(
        voter_id="V999",
        name="Unverified User",
        email="unverified@demo-election.local",
        eligible=True,
        verification_status=VerificationStatus.PENDING,
        has_voted=False,
        role="VOTER"
    )
    unverified_user = User(
        user_id="U999",
        voter_id="V999",
        name="Unverified User",
        email="unverified@demo-election.local",
        password_hash=hash_password("password123"),
        role=UserRole.VOTER,
        status=UserStatus.ACTIVE
    )

    db.add(ineligible_voter)
    db.add(ineligible_user)
    db.add(unverified_voter)
    db.add(unverified_user)
    db.commit()
        
    db.close()
    yield
    engine.dispose()
    if os.path.exists("test_election.db"):
        try:
            os.remove("test_election.db")
        except PermissionError:
            pass

client = TestClient(app)

# 1. AUTH TESTS
def test_auth_login_voter_success():
    response = client.post(
        "/auth/login",
        json={"email": "voter001@demo-election.local", "password": "password123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["role"] == "VOTER"

def test_auth_login_admin_success():
    response = client.post(
        "/auth/login",
        json={"email": "admin@demo-election.local", "password": "password123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["role"] == "ADMIN"

def test_auth_login_invalid_password():
    response = client.post(
        "/auth/login",
        json={"email": "voter001@demo-election.local", "password": "wrongpassword"}
    )
    assert response.status_code == 401

def test_unauthorized_access_rejection():
    response = client.get("/auth/me")
    assert response.status_code == 401

# 2. ELIGIBILITY TESTS
def test_voter_eligibility_authenticated():
    login_res = client.post(
        "/auth/login",
        json={"email": "voter001@demo-election.local", "password": "password123"}
    )
    token = login_res.json()["access_token"]
    response = client.get("/voters/me/eligibility", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()
    assert data["voter_id"] == "V001"
    assert data["eligible"] is True
    assert data["verification_status"] == "VERIFIED"

def test_ineligible_voter_rejection():
    login_res = client.post(
        "/auth/login",
        json={"email": "ineligible@demo-election.local", "password": "password123"}
    )
    token = login_res.json()["access_token"]
    response = client.post(
        "/elections/E001/vote",
        json={"candidate_id": "C001"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 403
    assert "eligible" in response.json()["detail"].lower()

def test_unverified_voter_rejection():
    login_res = client.post(
        "/auth/login",
        json={"email": "unverified@demo-election.local", "password": "password123"}
    )
    token = login_res.json()["access_token"]
    response = client.post(
        "/elections/E001/vote",
        json={"candidate_id": "C001"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 403

# 3. VOTING TESTS
def test_unauthenticated_vote_attempt():
    response = client.post("/elections/E001/vote", json={"candidate_id": "C001"})
    assert response.status_code == 401

def test_invalid_candidate_vote_rejection():
    login_res = client.post(
        "/auth/login",
        json={"email": "voter002@demo-election.local", "password": "password123"}
    )
    token = login_res.json()["access_token"]
    response = client.post(
        "/elections/E001/vote",
        json={"candidate_id": "C999"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 400

def test_voting_flow_and_duplicate_prevention():
    login_res = client.post(
        "/auth/login",
        json={"email": "voter001@demo-election.local", "password": "password123"}
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Cast vote
    vote_res = client.post("/elections/E001/vote", json={"candidate_id": "C001"}, headers=headers)
    assert vote_res.status_code == 201
    assert vote_res.json()["vote_status"] == "COUNTED"

    # Attempt duplicate vote
    dup_res = client.post("/elections/E001/vote", json={"candidate_id": "C002"}, headers=headers)
    assert dup_res.status_code == 409
    assert "already cast" in dup_res.json()["detail"]

# 4. ELECTION & CANDIDATE ADMIN TESTS
def test_admin_candidate_creation():
    login_res = client.post("/auth/login", json={"email": "admin@demo-election.local", "password": "password123"})
    token = login_res.json()["access_token"]
    response = client.post(
        "/elections/E001/candidates",
        json={"name": "New Candidate", "department": "CS", "symbol": "N", "manifesto": "Test manifesto"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 201

# 5. RESULTS & AUDIT LOG TESTS
def test_admin_results_and_audit_logs():
    login_res = client.post("/auth/login", json={"email": "admin@demo-election.local", "password": "password123"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    results_res = client.get("/elections/E001/results", headers=headers)
    assert results_res.status_code == 200
    results_data = results_res.json()
    assert results_data["total_votes_cast"] >= 31

    audit_res = client.get("/audit-logs", headers=headers)
    assert audit_res.status_code == 200
    logs = audit_res.json()
    assert len(logs) > 0

    for log in logs:
        if log["action"] in ["VOTE_CAST", "VOTE_REJECTED_DUPLICATE"]:
            assert "C001" not in log["action"]
            assert "C002" not in log["action"]

def test_closed_election_results_public_access():
    login_res = client.post("/auth/login", json={"email": "admin@demo-election.local", "password": "password123"})
    admin_token = login_res.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # Close election
    patch_res = client.patch("/elections/E001/status", json={"status": "CLOSED"}, headers=admin_headers)
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "CLOSED"

    # Voter can now view results
    voter_login = client.post("/auth/login", json={"email": "voter002@demo-election.local", "password": "password123"})
    voter_token = voter_login.json()["access_token"]
    
    results_res = client.get("/elections/E001/results", headers={"Authorization": f"Bearer {voter_token}"})
    assert results_res.status_code == 200

# 6. AI CONTEXT RETRIEVAL TEST
def test_ai_context():
    response = client.get("/ai/context/E001")
    assert response.status_code == 200
    data = response.json()
    assert data["election_id"] == "E001"
    assert len(data["candidates"]) >= 5
    assert "turnout" in data
