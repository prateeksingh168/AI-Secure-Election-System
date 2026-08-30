# AI-Based Secure Election & Intelligent Voting System

> A secure, privacy-aware, AI-assisted digital election prototype for educational, research, and demonstration purposes.

![Project Status](https://img.shields.io/badge/status-prototype-blue)
![Frontend](https://img.shields.io/badge/frontend-React-61DAFB)
![Backend](https://img.shields.io/badge/backend-FastAPI-009688)
![Database](https://img.shields.io/badge/database-SQLite-003B57)
![AI](https://img.shields.io/badge/AI-Intelligent%20Assistant-purple)

---

## Project Status

**Prototype - Educational / Research / Demonstration**

This project is currently developed as a functional prototype demonstrating a secure digital election workflow with authentication, voter eligibility, biometric verification, voting, AI assistance, analytics, and audit logging.

> **Disclaimer:** This project is not intended for use in real public elections or production electoral infrastructure.

## Disclaimer

This project is an educational prototype and is not intended for use in real public elections or production electoral infrastructure.

## Project Overview

The AI-Based Secure Election & Intelligent Voting System is a web-based secure election prototype demonstrating authentication, voter eligibility, biometric verification, secure vote casting, database validation, audit logging, analytics, and an AI-powered election assistant.

The system provides separate interfaces for:

- **Voters** - secure voting workflow and election information
- **Administrators** - election monitoring, analytics, participation, and audit information

## Key Features

### Authentication

- Voter and administrator login
- Role-based portal access
- JWT-based authentication
- Protected backend APIs
- Portal-role consistency validation

### Secure Voting

- Election-specific voter eligibility
- Candidate validation
- One-person-one-vote enforcement
- Duplicate vote prevention
- Vote confirmation
- Receipt ID generation

### Biometric Verification

- Biometric enrollment workflow
- Face verification workflow
- Backend biometric verification endpoint
- Verification session/token support
- Voter-specific biometric authorization

### AI Election Assistant

The AI assistant answers election-related questions using the election knowledge base and election context.

Example questions:

- Who is eligible to vote?
- What is the minimum voting age?
- How do I vote?
- Can I vote more than once?
- Can election officers see my vote?
- What are the election dates?
- Who are the candidates?
- What is the current turnout?
- How do I know my vote was submitted?
- What security features are used?

### Admin Analytics

- Total votes cast
- Eligible voters
- Voter turnout
- Candidate-wise vote distribution
- Election status

### Audit Logging

Important system activities are recorded through audit logs, including login events, failed authentication, vote casting, rejected voting attempts, duplicate vote attempts, eligibility failures, and biometric failures.

## Voter Workflow

`	ext
Login
  -> Authentication
  -> Eligibility Check
  -> Election Dashboard
  -> View Candidates
  -> Biometric Verification
  -> Open Ballot
  -> Select Candidate
  -> Confirm Vote
  -> Backend Validation
  -> Vote Recorded
  -> Receipt ID
`

## Admin Workflow

`	ext
Admin Login
  -> Admin Dashboard
  -> Election Monitoring
  -> Analytics
  -> Candidate-wise Results
  -> Voter Participation
  -> Audit Logs
`

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite |
| HTTP Client | Axios |
| Backend | Python, FastAPI |
| ORM | SQLAlchemy |
| Validation | Pydantic |
| Database | SQLite |
| Authentication | JWT |
| Charts | Chart.js |
| Icons | Lucide React |
| AI | Election Knowledge Base + Q&A |

## Project Structure

AI-Secure-Election-System/
|
+-- ai/
|   +-- knowledge/
|
+-- backend/
|   +-- routers/
|   +-- schemas/
|   +-- services/
|   +-- models/
|   +-- main.py
|   +-- database.py
|
+-- database/
|
+-- docs/
|
+-- public/
|
+-- src/
|   +-- services/
|   +-- App.jsx
|   +-- App.css
|   +-- index.css
|   +-- main.jsx
|
+-- tests/
|
+-- .gitignore
+-- package.json
+-- package-lock.json
+-- README.md

## Getting Started

### Clone

`ash
git clone https://github.com/prateeksingh168/AI-Secure-Election-System.git
cd AI-Secure-Election-System
`

### Frontend

`ash
npm install
npm run dev
`

Frontend: http://localhost:5173

### Backend

`ash
cd backend
python -m venv venv
.\\venv\\Scripts\\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload
`

Backend: http://localhost:8000

Swagger API documentation: http://localhost:8000/docs

## Demo Accounts

### Demo Voter

`	ext
Email: voter001@demo-election.local
Password: password123
`

### Demo Administrator

`	ext
Email: admin@demo-election.local
Password: password123
`

> Demo credentials are intended only for local educational testing.

## Election Eligibility

For this prototype:

- Minimum voting age: **18 years**
- Voter must be registered
- Voter must be verified
- Voter must satisfy applicable election requirements
- Voter must be registered for the specific election
- Each eligible voter can cast only one vote per election

## Security Model

The system demonstrates JWT authentication, role-based authorization, election-specific eligibility checks, biometric verification, duplicate vote prevention, database-level validation, audit logging, and separation of voter identity from candidate-choice information.

## API Overview

| Module | Endpoint | Purpose |
|---|---|---|
| Authentication | /auth/login | User login |
| Authentication | /auth/me | Current user |
| Elections | /elections | Election information |
| Candidates | /elections/{id}/candidates | Candidate information |
| Eligibility | /voters/me/eligibility | Eligibility check |
| Voting | /elections/{id}/vote | Cast vote |
| Results | /elections/{id}/results | Election results |
| Audit | /audit-logs | Audit information |
| AI | /ai/ask/{id} | AI election Q&A |
| Biometrics | /biometrics/enroll | Biometric enrollment |
| Biometrics | /biometrics/verify | Biometric verification |

## Validation

The project has been locally validated through frontend production builds, Python syntax compilation, authentication, voter eligibility, biometric verification, vote casting, duplicate vote prevention, AI assistant Q&A, admin analytics, and audit logging.

Run frontend validation:

`ash
npm run build
`

## Documentation

docs/
|
+-- architecture/
+-- screenshots/
+-- api/
+-- project-report/

## Limitations

VoteSphere is an educational prototype and is **not production-ready electoral infrastructure**.

Real-world election systems require extensive security audits, cryptographic protections, legal compliance, accessibility standards, penetration testing, high-availability infrastructure, disaster recovery, and independent oversight.

## Future Scope

- Advanced AI/RAG election assistant
- Improved biometric verification
- Multi-factor authentication
- Stronger cryptographic ballot protection
- PostgreSQL deployment
- Cloud deployment
- Real-time election monitoring
- CI/CD pipeline
- Automated security testing
- Comprehensive test coverage

## Contributors

- **Prateek Singh** 
- **Arin Tripathi**
- **Shaurya**
- **Anamika**

---

**VoteSphere - AI-Based Secure Election & Intelligent Voting System**

Built as an educational prototype demonstrating secure digital election workflows, AI assistance, biometric verification, analytics, and auditability.

