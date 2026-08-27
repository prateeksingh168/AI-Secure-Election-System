from routers.auth import router as auth_router
from routers.voters import router as voters_router
from routers.elections import router as elections_router
from routers.candidates import router as candidates_router
from routers.voting import router as voting_router
from routers.results import router as results_router
from routers.audit import router as audit_router
from routers.ai_context import router as ai_context_router
from routers.biometrics import router as biometrics_router

__all__ = [
    "auth_router",
    "voters_router",
    "elections_router",
    "candidates_router",
    "voting_router",
    "results_router",
    "audit_router",
    "ai_context_router",
    "biometrics_router",
]
