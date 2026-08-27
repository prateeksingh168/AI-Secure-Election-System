from __future__ import annotations

import logging
import os
import sys
import time
import uuid
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field


# ============================================================
# PATH SETUP
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[2]

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

ENV_PATH = PROJECT_ROOT / ".env"

load_dotenv(dotenv_path=ENV_PATH)


# Import AFTER path setup
from ai.chatbot.assistant import ElectionAssistant

try:
    from ai.analytics.election_analytics import ElectionAnalytics
except ImportError:
    ElectionAnalytics = None


# ============================================================
# LOGGING
# ============================================================

LOG_DIR = PROJECT_ROOT / "ai" / "logs"
LOG_DIR.mkdir(parents=True, exist_ok=True)

logger = logging.getLogger("election-ai")
logger.setLevel(logging.INFO)

if not logger.handlers:

    console_handler = logging.StreamHandler()

    file_handler = logging.FileHandler(
        LOG_DIR / "assistant.log",
        encoding="utf-8"
    )

    formatter = logging.Formatter(
        "%(asctime)s | %(levelname)s | %(message)s"
    )

    console_handler.setFormatter(formatter)
    file_handler.setFormatter(formatter)

    logger.addHandler(console_handler)
    logger.addHandler(file_handler)


# ============================================================
# APPLICATION STATE
# ============================================================

assistant_instance = None
analytics_instance = None


# ============================================================
# STARTUP / SHUTDOWN
# ============================================================

@asynccontextmanager
async def lifespan(app: FastAPI):

    global assistant_instance
    global analytics_instance

    logger.info("=" * 60)
    logger.info("Starting AI Election Assistant")
    logger.info("Project root: %s", PROJECT_ROOT)
    logger.info("Environment file: %s", ENV_PATH)

    provider = os.getenv("AI_PROVIDER", "grok")
    model = os.getenv("GROK_MODEL", "not-set")
    api_key = os.getenv("XAI_API_KEY")

    logger.info("AI provider: %s", provider)
    logger.info("AI model: %s", model)
    logger.info("xAI API key loaded: %s", bool(api_key))

    try:
        assistant_instance = ElectionAssistant()

        logger.info(
            "Assistant initialized successfully."
        )

        logger.info(
            "Documents loaded: %s",
            len(assistant_instance.retriever.documents)
        )

        logger.info(
            "LLM configured: %s",
            assistant_instance.client is not None
        )

    except Exception:
        logger.exception(
            "Failed to initialize ElectionAssistant"
        )
        assistant_instance = None

    if ElectionAnalytics is not None:

        try:
            analytics_instance = ElectionAnalytics()

            logger.info(
                "Analytics initialized successfully."
            )

        except Exception:
            logger.exception(
                "Analytics initialization failed."
            )
            analytics_instance = None

    else:
        logger.warning(
            "ElectionAnalytics could not be imported."
        )

    logger.info("=" * 60)

    yield

    logger.info("Shutting down AI Election Assistant.")


# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="AI Election Assistant API",
    description=(
        "AI assistant and analytics service for "
        "the AI-Based Secure Election System."
    ),
    version="2.0.0",
    lifespan=lifespan
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# REQUEST LOGGING
# ============================================================

@app.middleware("http")
async def request_logger(request: Request, call_next):

    request_id = str(uuid.uuid4())[:8]

    start_time = time.perf_counter()

    logger.info(
        "[%s] %s %s",
        request_id,
        request.method,
        request.url.path
    )

    try:

        response = await call_next(request)

        elapsed = time.perf_counter() - start_time

        logger.info(
            "[%s] %s %s -> %s (%.3fs)",
            request_id,
            request.method,
            request.url.path,
            response.status_code,
            elapsed
        )

        response.headers["X-Request-ID"] = request_id

        return response

    except Exception:

        logger.exception(
            "[%s] Unhandled request error",
            request_id
        )

        raise


# ============================================================
# REQUEST / RESPONSE SCHEMAS
# ============================================================

class ChatRequest(BaseModel):

    question: str = Field(
        ...,
        min_length=1,
        max_length=1000,
        description="Election-related question"
    )


class ChatResponse(BaseModel):

    answer: str
    sources: list = []
    mode: str
    provider: str
    model: Optional[str] = None


# ============================================================
# ROOT
# ============================================================

@app.get("/")
async def root():

    return {
        "service": "AI Election Assistant API",
        "version": "2.0.0",
        "status": "running",

        "endpoints": {
            "documentation": "/docs",
            "health": "/health",
            "readiness": "/health/ready",
            "chat": "POST /ai/chat",
            "turnout": "/ai/analytics/turnout",
            "candidate_distribution":
                "/ai/analytics/candidate-distribution",
            "summary": "/ai/analytics/summary"
        }
    }


# ============================================================
# SIMPLE HEALTH CHECK
# ============================================================

@app.get("/health")
async def health():

    return {
        "status": "ok",
        "service": "AI Election Assistant"
    }


# ============================================================
# DETAILED READINESS CHECK
# ============================================================

@app.get("/health/ready")
async def readiness():

    if assistant_instance is None:

        return JSONResponse(
            status_code=503,
            content={
                "status": "not_ready",
                "assistant": False,
                "message":
                    "ElectionAssistant failed to initialize."
            }
        )

    try:

        document_count = len(
            assistant_instance.retriever.documents
        )

        llm_configured = (
            assistant_instance.client is not None
        )

        return {
            "status": "ready",

            "assistant": True,

            "provider":
                assistant_instance.provider,

            "model":
                assistant_instance.model,

            "llm_configured":
                llm_configured,

            "retriever_ready":
                document_count > 0,

            "documents_loaded":
                document_count,

            "analytics_ready":
                analytics_instance is not None
        }

    except Exception as exc:

        logger.exception(
            "Readiness check failed."
        )

        return JSONResponse(
            status_code=503,
            content={
                "status": "not_ready",
                "error": str(exc)
            }
        )


# ============================================================
# CHATBOT ENDPOINT
# ============================================================

@app.post(
    "/ai/chat",
    response_model=ChatResponse
)
async def chat(payload: ChatRequest):

    if assistant_instance is None:

        raise HTTPException(
            status_code=503,
            detail="AI assistant is not initialized."
        )

    question = payload.question.strip()

    if not question:

        raise HTTPException(
            status_code=400,
            detail="Question cannot be empty."
        )

    logger.info(
        "Chat request received. Length=%d",
        len(question)
    )

    try:

        result = assistant_instance.answer(
            question
        )

        answer = result.get(
            "answer",
            "No answer generated."
        )

        sources = result.get(
            "sources",
            []
        )

        mode = result.get(
            "mode",
            "unknown"
        )

        logger.info(
            "Chat completed | mode=%s | sources=%d",
            mode,
            len(sources)
        )

        return ChatResponse(
            answer=answer,
            sources=sources,
            mode=mode,
            provider=assistant_instance.provider,
            model=assistant_instance.model
        )

    except Exception as exc:

        logger.exception(
            "AI generation failed."
        )

        # --------------------------------------------
        # SAFE RETRIEVAL FALLBACK
        # --------------------------------------------

        try:

            docs = assistant_instance.retriever.retrieve(
                question,
                top_k=4
            )

            if not docs:

                return ChatResponse(
                    answer=(
                        "I could not find this information "
                        "in the official election knowledge base."
                    ),
                    sources=[],
                    mode="fallback_no_context",
                    provider=assistant_instance.provider,
                    model=assistant_instance.model
                )

            answer = (
                assistant_instance._fallback_answer(
                    question,
                    docs
                )
            )

            sources = [
                {
                    "source": doc.source,
                    "score": round(
                        float(doc.score),
                        4
                    )
                }
                for doc in docs
            ]

            logger.warning(
                "LLM failed; retrieval fallback used."
            )

            return ChatResponse(
                answer=answer,
                sources=sources,
                mode="retrieval_fallback",
                provider=assistant_instance.provider,
                model=assistant_instance.model
            )

        except Exception:

            logger.exception(
                "Retrieval fallback also failed."
            )

            raise HTTPException(
                status_code=503,
                detail=(
                    "AI assistant is temporarily unavailable."
                )
            )


# ============================================================
# TURNOUT ANALYTICS
# ============================================================

@app.get(
    "/ai/analytics/turnout"
)
async def turnout(
    election_id: Optional[str] = None
):

    if analytics_instance is None:

        raise HTTPException(
            status_code=503,
            detail="Analytics module is not available."
        )

    try:

        return analytics_instance.calculate_turnout(
            election_id=election_id
        )

    except Exception:

        logger.exception(
            "Turnout analytics failed."
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to calculate turnout."
        )


# ============================================================
# CANDIDATE VOTE DISTRIBUTION
# ============================================================

@app.get(
    "/ai/analytics/candidate-distribution"
)
async def candidate_distribution(
    election_id: Optional[str] = None
):

    if analytics_instance is None:

        raise HTTPException(
            status_code=503,
            detail="Analytics module is not available."
        )

    try:

        return (
            analytics_instance
            .candidate_vote_distribution(
                election_id=election_id
            )
        )

    except Exception:

        logger.exception(
            "Candidate distribution calculation failed."
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to calculate "
                "candidate vote distribution."
            )
        )


# ============================================================
# ELECTION ANALYTICS SUMMARY
# ============================================================

@app.get(
    "/ai/analytics/summary"
)
async def analytics_summary(
    election_id: Optional[str] = None
):

    if analytics_instance is None:

        raise HTTPException(
            status_code=503,
            detail="Analytics module is not available."
        )

    try:

        return analytics_instance.election_summary(
            election_id=election_id
        )

    except Exception:

        logger.exception(
            "Election analytics summary failed."
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to generate analytics summary."
        )


# ============================================================
# DEBUG: RETRIEVAL
# ============================================================

@app.get(
    "/ai/debug/retrieval",
    include_in_schema=False
)
async def debug_retrieval(
    question: str
):

    if assistant_instance is None:

        raise HTTPException(
            status_code=503,
            detail="Assistant unavailable."
        )

    docs = (
        assistant_instance
        .retriever
        .retrieve(
            question,
            top_k=5
        )
    )

    return {
        "question": question,

        "results": [
            {
                "source": doc.source,
                "title": doc.title,
                "content": doc.content,
                "score": round(
                    float(doc.score),
                    4
                )
            }
            for doc in docs
        ]
    }


# ============================================================
# GLOBAL ERROR HANDLER
# ============================================================

@app.exception_handler(Exception)
async def global_exception_handler(
    request: Request,
    exc: Exception
):

    logger.exception(
        "Unexpected error on %s",
        request.url.path
    )

    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error.",
            "path": request.url.path
        }
    )