# AI-Based Secure Election & Intelligent Voting System (Backend API)

This repository contains the backend service layer for the digital voting prototype. It enforces strict voter authentication, biometric verification, voter eligibility validation, secure vote casting, system-wide audit logging, and AI context integration.

---

## 🛠️ Technology Stack

- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Asynchronous Python Web Framework)
- **Database ORM**: [SQLAlchemy](https://www.sqlalchemy.org/) with SQLite (local development) / PostgreSQL compatibility
- **Data Validation**: [Pydantic V2](https://docs.pydantic.dev/latest/) (strict request/response model schema validation)
- **Security & Cryptography**: 
  - Salted Password Hashing using [bcrypt](https://pypi.org/project/bcrypt/)
  - Stateless authentication via [PyJWT](https://pyjwt.readthedocs.io/) (JSON Web Tokens)
- **Testing**: [pytest](https://docs.pytest.org/) (comprehensive integration & edge-case test suites)
- **Configuration**: [python-dotenv](https://pypi.org/project/python-dotenv/) for secure environment variables

---

## 🏛️ System Architecture

The codebase follows a clean, modular **Controller-Service-Data** design pattern:

```text
backend/
├── main.py                 # Application entrypoint & CORS middleware configuration
├── database.py             # Database engine setup and connection session manager
├── models/                 # Database Schema Definition (SQLAlchemy ORM Models)
│   ├── user.py             # Admins and Voters credentials
│   ├── voter.py            # Eligibility status, registration, and department mapping
│   ├── election.py         # Active/closed election states and date limits
│   ├── candidate.py        # Candidate profiles and symbol registrations
│   ├── vote.py             # Cryptographically stored votes
│   ├── audit_log.py        # Audit entries tracking critical system activities
│   └── biometric.py        # Salted biometric templates and active methods
├── schemas/                # Request/Response Data Validation Layer (Pydantic V2 Schemas)
│   └── (user, voter, election, candidate, vote, audit, biometric, ai_context).py
├── services/               # Core Business Logic Layer (Internal validation and helpers)
│   ├── auth.py             # Password verification, JWT issue and validation
│   ├── voting.py           # 6-step transactional voting eligibility check
│   ├── biometric_service.py # Vector distance checks, rate-limiting, and session token issuance
│   ├── biometric_input_adapter.py # Input adapter to parse vector embeddings, base64 images, or vendor results
│   └── audit.py            # Secure system-wide event audit logging
├── routers/                # API Routing Layer (FastAPI HTTP endpoints)
│   └── (auth, voters, elections, candidates, voting, results, audit, ai_context, biometrics).py
├── seed/                   # Database Seeder (Uses synthetic CSV data to populate local databases)
└── tests/                  # Test Suites (Comprehensive API endpoints and biometric verification test coverage)
```

---

## 🚀 Key Features & Implementation

### 1. Robust Biometric Verification Module
- **Input Normalization**: Translates raw embeddings, base64 images, or 3rd-party vendor results into normalized representations. Discards raw image data instantly to maintain voter privacy.
- **Biometric Session Token**: Generates a short-lived `biometric_token` valid for 15 minutes upon successful biometric match.
- **Lockout Rate Limiting**: Automatically locks voter biometrics after 5 consecutive failed verification attempts within 10 minutes to protect against brute-force or injection attacks.

### 2. Dual-Authentication Engine
- Seamlessly handles JSON payloads from frontend clients as well as form-encoded payloads from the Swagger UI Authorize utility to prevent common `422 Unprocessable Entity` login errors.

### 3. Double-Voting Prevention
- Enforces strict constraints (`UniqueConstraint("voter_id", "election_id")`) inside the transactional database layer to block duplicate votes even under concurrent requests.

### 4. System-Wide Audit Logging
- Automatically logs all critical events (e.g., `VOTE_CAST`, `VOTE_REJECTED_NO_BIOMETRIC`, `BIOMETRIC_LOCKED`, `CANDIDATES_ADDED`) with exact timestamps and actor records.

---

## 🏃 Run & Test Locally

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```
2. **Start the API Server**:
   ```bash
   uvicorn main:app --reload
   ```
3. **Access API Documentation**:
   - Swagger UI: `http://127.0.0.1:8000/docs`
   - ReDoc: `http://127.0.0.1:8000/redoc`
4. **Run Automated Tests**:
   ```bash
   pytest tests/
   ```
