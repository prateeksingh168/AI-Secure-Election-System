\# 🗳️ AI-Based Secure Election and Intelligent Voting System



> A secure, transparent, privacy-aware, and AI-assisted digital election prototype.



\*\*Project Status:\*\* Prototype  

\*\*Purpose:\*\* Educational, Research \& Demonstration



\---



\## 📌 Project Overview



The \*\*AI-Based Secure Election and Intelligent Voting System\*\* is a web-based election prototype that demonstrates how modern web technologies, backend APIs, database systems, biometric verification, Artificial Intelligence, and analytics can be integrated into a digital voting workflow.



The system provides separate interfaces for \*\*voters\*\* and \*\*administrators\*\*.



\### Current Prototype Features



\- 🔐 User Authentication

\- 👤 Voter Verification and Eligibility

\- 🧑‍💼 Election Management

\- 🗳️ Candidate Selection and Vote Casting

\- 🧑‍🦰 Face Enrollment

\- 🔎 Face Verification

\- 🚫 Duplicate Vote Prevention

\- 🔐 Biometric Session Token

\- 📋 Audit Logging

\- 🤖 AI Election Assistant

\- 📊 Election Analytics

\- 🔒 Protected Backend APIs

\- 🗄️ SQLite Database Storage



> ⚠️ \*\*Important:\*\* This project is a prototype developed for educational, research, and demonstration purposes. It is not intended for use in real public elections.



\---



\# 🎯 Problem Statement



Traditional election processes can involve challenges related to:



\- Security

\- Voter verification

\- Duplicate voting

\- Election management

\- Transparency

\- Auditability

\- Voter information access

\- Efficient election monitoring



This project demonstrates a modular digital election platform that combines:



\*\*Authentication + Voter Verification + Biometric Verification + Secure Voting + Database Constraints + Audit Logging + AI Assistance + Analytics\*\*



\---



\# 💡 Proposed Solution



The system provides two major interfaces:



1\. \*\*Voter Portal\*\*

2\. \*\*Admin Portal\*\*



\---



\# 👤 Voter Portal



An authenticated voter can follow the complete voting workflow:



1\. Login

2\. Access voter dashboard

3\. View election information

4\. View available candidates

5\. Select a candidate

6\. Complete face enrollment

7\. Complete face verification

8\. Receive biometric verification token

9\. Confirm selected candidate

10\. Cast final vote

11\. Receive vote confirmation and receipt ID

12\. Prevent duplicate voting in the same election



\---



\# 👨‍💼 Admin Portal



The administrator can access the administration dashboard and manage election-related information.



\### Current Admin Features



\- Election management

\- Candidate management

\- Election status

\- Voter/election monitoring

\- Analytics

\- Audit Logs

\- Logout



\---



\# ✨ Key Features



\## 🔐 1. Authentication



The system provides authenticated access to protected functionality.



\### Features



\- Login

\- Password verification

\- Password hashing

\- JWT/access-token based authentication

\- Role-based access

\- Protected API requests

\- Logout



\---



\## 👤 2. Voter Eligibility Verification



Before accepting a vote, the backend verifies the voter record.



The voting service checks:



\- Authenticated user

\- Associated voter profile

\- Voter existence

\- Voter eligibility

\- Verification status



\---



\## 🧑‍🦰 3. Face Enrollment



The voter can use the device camera during the voting workflow.



\### Current Prototype Flow



```text

Camera

&#x20;  ↓

Face Capture

&#x20;  ↓

Base64 Image

&#x20;  ↓

Backend Biometric API

&#x20;  ↓

Biometric Processing

&#x20;  ↓

Template Hash

&#x20;  ↓

SQLite Database

```



The biometric record stores a derived template/hash rather than storing the raw camera image as the biometric database record.



> ⚠️ \*\*Prototype Limitation:\*\* The current embedding extraction is a deterministic stub implementation. It is intended for demonstration and testing and should not be considered production-grade face recognition.



\---



\## 🔎 4. Face Verification



After face enrollment, the voter completes a face verification step.



```text

Voter

&#x20;  ↓

Camera

&#x20;  ↓

Face Verification Request

&#x20;  ↓

Backend Biometric Service

&#x20;  ↓

Verification Result

&#x20;  ↓

Biometric Session Token

&#x20;  ↓

Voting Process

```



A successful verification provides a temporary biometric session token which is used during vote casting.



\---



\# 🗳️ 5. Secure Vote Casting



The vote API performs multiple backend validations before recording a vote.



\### Backend Validation Flow



1\. Authentication

2\. Voter profile validation

3\. Biometric verification

4\. Voter eligibility

5\. Voter verification status

6\. Election existence

7\. Election active status

8\. Election voting timeframe

9\. Duplicate vote check

10\. Candidate validation



Only after successful validation is the vote recorded.



\---



\# 🚫 6. Duplicate Vote Prevention



The system prevents a voter from casting multiple votes in the same election.



\### Application-Level Protection



The backend checks:



```text

voter.has\_voted

```



and also checks whether an existing vote already exists for:



```text

election\_id + voter\_id

```



\### Database-Level Protection



The `votes` table contains a unique constraint:



```text

(election\_id, voter\_id)

```



This provides an additional database-level protection against duplicate votes.



\---



\# 🤖 7. AI Election Assistant



The project includes an AI Election Assistant designed to provide informational support.



The assistant can provide election-related information such as:



\- Election rules

\- Voting procedure

\- Election schedule

\- Candidate information

\- Candidate manifestos

\- Frequently asked questions



The AI assistant is intended for \*\*informational support\*\* and does not make final voter eligibility or voting decisions.



\---



\# 📊 8. Election Analytics



The Admin Dashboard provides election analytics.



\### Current Analytics Include



\- Total voters

\- Votes cast

\- Voter turnout percentage

\- Candidate-wise vote distribution

\- Visual charts



The current prototype uses application/demo data depending on the analytics screen.



\---



\# 📋 9. Audit Logging



The backend contains an audit logging mechanism for important system and election events.



\### Examples



\- Authentication events

\- Election events

\- Candidate events

\- Vote submission

\- Rejected voting attempts

\- Election status changes



Audit logging is designed to provide traceability without unnecessarily recording the voter's selected candidate in the audit event.



\---



\# 🏗️ System Architecture



```text

&#x20;                        ┌─────────────────────┐

&#x20;                        │        User         │

&#x20;                        └──────────┬──────────┘

&#x20;                                   │

&#x20;                    ┌──────────────┴──────────────┐

&#x20;                    │                             │

&#x20;            ┌───────▼────────┐          ┌────────▼────────┐

&#x20;            │  Voter Portal   │          │   Admin Portal  │

&#x20;            └───────┬────────┘          └────────┬────────┘

&#x20;                    │                            │

&#x20;                    └──────────────┬─────────────┘

&#x20;                                   │

&#x20;                         ┌─────────▼─────────┐

&#x20;                         │   React + Vite    │

&#x20;                         │     Frontend      │

&#x20;                         └─────────┬─────────┘

&#x20;                                   │

&#x20;                             HTTP / REST API

&#x20;                                   │

&#x20;                         ┌─────────▼─────────┐

&#x20;                         │  FastAPI Backend  │

&#x20;                         └─────────┬─────────┘

&#x20;                                   │

&#x20;             ┌─────────────────────┼─────────────────────┐

&#x20;             │                     │                     │

&#x20;      ┌──────▼───────┐     ┌───────▼──────┐      ┌──────▼──────┐

&#x20;      │Authentication │     │  Biometric   │      │   Voting    │

&#x20;      │ \& Authorization│    │   Services   │      │   Services  │

&#x20;      └──────┬────────┘     └───────┬──────┘      └──────┬──────┘

&#x20;             │                      │                     │

&#x20;             └──────────────────────┼─────────────────────┘

&#x20;                                    │

&#x20;                           ┌────────▼────────┐

&#x20;                           │ SQLite Database  │

&#x20;                           │   election.db   │

&#x20;                           └────────┬────────┘

&#x20;                                    │

&#x20;                  ┌─────────────────┼─────────────────┐

&#x20;                  │                 │                 │

&#x20;           ┌──────▼──────┐  ┌───────▼──────┐  ┌──────▼────────┐

&#x20;           │ Users/Voters│  │ Elections \&  │  │ Votes \&       │

&#x20;           │             │  │ Candidates   │  │ Biometrics    │

&#x20;           └─────────────┘  └──────────────┘  └───────────────┘

```



\---



\# 🔄 Complete Voting Workflow



```text

Voter Login

&#x20;    ↓

Authentication

&#x20;    ↓

Voter Dashboard

&#x20;    ↓

Select Election

&#x20;    ↓

View Candidates

&#x20;    ↓

Select Candidate

&#x20;    ↓

Face Enrollment

&#x20;    ↓

Face Verification

&#x20;    ↓

Biometric Session Token

&#x20;    ↓

Vote Confirmation

&#x20;    ↓

Cast Final Vote

&#x20;    ↓

Backend Validation

&#x20;    ↓

Duplicate Vote Check

&#x20;    ↓

Candidate Validation

&#x20;    ↓

Record Vote

&#x20;    ↓

Create Audit Event

&#x20;    ↓

Vote Confirmation

&#x20;    ↓

Receipt ID

```



\---



\# 🧑‍🦰 Biometric Workflow



```text

Browser Camera

&#x20;     ↓

Face Enrollment

&#x20;     ↓

POST /biometrics/enroll

&#x20;     ↓

Biometric Processing

&#x20;     ↓

Biometric Record

&#x20;     ↓

SQLite Database

&#x20;     ↓

Face Verification

&#x20;     ↓

POST /biometrics/verify

&#x20;     ↓

Verification Result

&#x20;     ↓

Temporary Biometric Token

&#x20;     ↓

POST /elections/{election\_id}/vote

```



\---



\# 🗄️ Database Design



The current prototype uses:



\- \*\*SQLite\*\*

\- \*\*SQLAlchemy ORM\*\*



\### Local Database



```text

backend/election.db

```



\### Main Entities



| Entity | Purpose |

|---|---|

| `users` | Authentication and role information |

| `voters` | Voter eligibility and verification |

| `elections` | Election details, schedule and status |

| `candidates` | Candidate information |

| `votes` | Recorded vote information |

| `biometric\_records` | Biometric template/hash records |

| `audit\_logs` | System and election activity |



\---



\# 📁 Project Structure



```text

AI-Secure-Election-System/

│

├── ai/

│   ├── analytics/

│   ├── chatbot/

│   ├── knowledge/

│   └── README.md

│

├── backend/

│   ├── models/

│   ├── routers/

│   ├── schemas/

│   ├── services/

│   ├── seed/

│   ├── tests/

│   ├── main.py

│   └── requirements.txt

│

├── database/

│   ├── data/

│   ├── schema.sql

│   └── README.md

│

├── docs/

│   ├── architecture/

│   ├── api/

│   ├── screenshots/

│   └── README.md

│

├── frontend/

│   └── README.md

│

├── public/

│

├── src/

│   ├── components/

│   ├── context/

│   ├── data/

│   ├── pages/

│   └── api/

│

├── tests/

│

├── .gitignore

├── index.html

├── package.json

├── package-lock.json

├── vite.config.js

├── tailwind.config.js

└── README.md

```



\---



\# 🛠️ Technology Stack



| Layer | Technology |

|---|---|

| Frontend | React |

| Build Tool | Vite |

| Styling | Tailwind CSS |

| Backend | Python |

| API Framework | FastAPI |

| ORM | SQLAlchemy |

| Database | SQLite |

| Authentication | JWT + Password Hashing |

| Biometric | Browser Camera + Prototype Biometric Processing |

| AI | AI Election Assistant |

| Analytics | Analytics Dashboard |

| Version Control | Git + GitHub |



\---



\# 🔐 Security Principles



The prototype follows several security-oriented principles:



\- Authentication before protected operations

\- Role-based access

\- Password hashing

\- Backend-side validation

\- Voter eligibility checks

\- Biometric verification before voting

\- Duplicate vote prevention

\- Database-level uniqueness constraint

\- Protected API endpoints

\- Audit event generation

\- Derived biometric template/hash storage

\- `.env` excluded through `.gitignore`

\- Database files excluded through `.gitignore`

\- Synthetic/demo data for development



\---



\# 🧪 Testing Performed



The integrated prototype was tested through the local frontend and backend.



\## Authentication



\- ✅ Valid login

\- ✅ Invalid login handling

\- ✅ Protected API authentication

\- ✅ Logout



\## Voting



\- ✅ Candidate selection

\- ✅ Face enrollment

\- ✅ Face verification

\- ✅ Biometric token generation

\- ✅ Final vote submission

\- ✅ Backend vote validation

\- ✅ Successful vote response (`201 Created`)

\- ✅ Vote confirmation page

\- ✅ Receipt ID generation

\- ✅ Duplicate vote protection



\## Admin



\- ✅ Admin login

\- ✅ Admin dashboard

\- ✅ Election management interface

\- ✅ Candidate management interface

\- ✅ Analytics

\- ✅ Audit Logs

\- ✅ Logout



\## Integration



Frontend:



```text

http://localhost:5173

```



Backend:



```text

http://127.0.0.1:8000

```



\---



\# 📊 Demo Data



The project uses synthetic/demo election data.



Example data includes:



\- Demo users

\- Demo voters

\- Demo election

\- Demo candidates

\- Demo analytics

\- Demo audit events



> 🔒 No real voter information should be used in this educational prototype.



\---



\# 🚀 How to Run the Project



\## 1. Clone Repository



```bash

git clone https://github.com/prateeksingh168/AI-Secure-Election-System.git

cd AI-Secure-Election-System

```



\---



\## 2. Install Frontend Dependencies



```bash

npm install

```



\---



\## 3. Start Frontend



```bash

npm run dev

```



Frontend normally runs at:



```text

http://localhost:5173

```



\---



\## 4. Start Backend



Open another terminal:



```bash

cd backend

python -m uvicorn main:app --reload

```



Backend normally runs at:



```text

http://127.0.0.1:8000

```



\---



\# 🔑 Demo Authentication



The development seed configuration uses demo accounts.



Default development password:



```text

password123

```



Use the demo user accounts provided by the project's seed configuration.



> ⚠️ Do not use demo credentials or this prototype configuration for a real production election system.



\---



\# 🌿 GitHub Development Workflow



The project uses Git branches and Pull Requests for collaborative development.



\### Main Branch



```text

main

```



\### Feature Branches



```text

main

│

├── ai-feature

├── backend-arin

├── database-security

├── database-sqlite

└── frontend-anamika

```



\### Recommended Workflow



```text

Create Feature Branch

&#x20;       ↓

Develop

&#x20;       ↓

Test

&#x20;       ↓

Commit

&#x20;       ↓

Push

&#x20;       ↓

Pull Request

&#x20;       ↓

Code Review

&#x20;       ↓

Merge into main

&#x20;       ↓

Integration Testing

```



The final integrated project is maintained on:



```text

main

```



\---



\# 👥 Team Responsibilities



| Role | Responsibility |

|---|---|

| 👑 Team Leader | Architecture, GitHub, integration, testing and coordination |

| 🎨 Frontend Developer | React UI, pages, components and API integration |

| ⚙️ Backend Developer | FastAPI APIs, authentication and voting logic |

| 🗄️ Database/Security Developer | Database design, constraints and secure data handling |

| 🤖 AI/Analytics Developer | AI Election Assistant and analytics functionality |



\---



\# ⚠️ Prototype Disclaimer



This project is developed for:



\- Educational purposes

\- Research

\- Academic demonstration

\- Software engineering practice



It is \*\*not a certified election system\*\*.



A real-world election platform would require extensive:



\- Independent security audits

\- Cryptographic verification

\- Privacy assessment

\- Legal compliance

\- Accessibility validation

\- Threat modeling

\- Penetration testing

\- Independent election auditing

\- High-assurance identity verification

\- Production-grade biometric systems



\---



\# 🚀 Future Scope



Potential future improvements include:



\- Production-grade face recognition

\- Stronger identity verification

\- Multi-factor authentication

\- Privacy-preserving voting protocols

\- End-to-end vote verifiability

\- Tamper-evident audit infrastructure

\- Advanced anomaly detection

\- Real-time election monitoring

\- Improved accessibility

\- Multilingual AI assistance

\- Cloud deployment

\- Comprehensive automated testing

\- Independent security auditing



\---



\# 📜 License



This project is intended for:



\*\*Educational, Research and Demonstration Purposes.\*\*



\---



\# ⭐ Project Summary



The \*\*AI-Based Secure Election and Intelligent Voting System\*\* demonstrates an integrated digital election workflow combining:



\*\*React + FastAPI + SQLite + SQLAlchemy + Authentication + Biometric Verification + Secure Voting + AI Assistance + Analytics + Audit Logging\*\*



The project demonstrates how these components can work together to create a structured and security-focused digital election prototype.



\---



\## 🔗 Repository



\*\*GitHub:\*\*  

https://github.com/prateeksingh168/AI-Secure-Election-System

