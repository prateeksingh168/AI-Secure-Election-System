import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from database import engine, Base
from seed import seed_database
from routers import (
    auth_router,
    voters_router,
    elections_router,
    candidates_router,
    voting_router,
    results_router,
    audit_router,
    ai_context_router,
    biometrics_router,
)

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables
    Base.metadata.create_all(bind=engine)
    # Seed database from synthetic CSVs if empty
    try:
        seed_database()
    except Exception as e:
        print(f"Lifespan seed error: {e}")
    yield

app = FastAPI(
    title="AI-Based Secure Election System API",
    description="Backend API layer for digital voting prototype enforcing strict authentication, biometric verification, voter eligibility, voting validation, audit logging, and AI context integration.",
    version="1.1.0",
    lifespan=lifespan
)

# Parse allowed origins from environment variable or default to local frontend development ports
raw_origins = os.getenv(
    "ALLOWED_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173,http://localhost:5176,http://127.0.0.1:5176"
)
allowed_origins = [origin.strip() for origin in raw_origins.split(",") if origin.strip()]

# CORS Middleware with explicit origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth_router)
app.include_router(voters_router)
app.include_router(elections_router)
app.include_router(candidates_router)
app.include_router(voting_router)
app.include_router(results_router)
app.include_router(audit_router)
app.include_router(ai_context_router)
app.include_router(biometrics_router)

@app.get("/")
def root():
    return {
        "status": "online",
        "system": "AI-Based Secure Election System Backend API",
        "version": "1.1.0",
        "docs_url": "/docs"
    }
