"""
TruthLens — FastAPI application entry point.

Features wired here:
- CORS (frontend origin allowlist)
- Rate limiting via slowapi
- Sentry error tracking
- Per-request DB session cleanup
- Router registration for auth, predict, history, admin
- /health endpoint for load-balancer probes
"""
import logging
import sentry_sdk
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from app.core.limiter import limiter

from app.core.config import get_settings
from app.db.session import create_db_and_tables

# Import all models so SQLModel sees them at table-creation time
from app.models import user, submission, feedback  # noqa: F401

from app.api.endpoints import auth, predict, history, admin

logger = logging.getLogger(__name__)
settings = get_settings()

# ---------------------------------------------------------------------------
# Sentry (only initialised when DSN is provided)
# ---------------------------------------------------------------------------
if settings.SENTRY_DSN:
    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        environment=settings.ENVIRONMENT,
        traces_sample_rate=0.2,
        # Never send request bodies to Sentry — they may contain PII
        request_bodies="never",
    )


# ---------------------------------------------------------------------------
# Lifespan — database table creation
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("TruthLens API starting up…")
    try:
        create_db_and_tables()
    except Exception as e:
        logger.warning(f"Database table creation skipped: {e}")
    yield
    logger.info("TruthLens API shutting down.")


# ---------------------------------------------------------------------------
# Application factory
# ---------------------------------------------------------------------------
app = FastAPI(
    title="TruthLens API",
    description="AI-powered fake news detection — prediction, history, feedback, and admin.",
    version="1.0.0",
    lifespan=lifespan,
    # Never expose internal Python errors in the response body
    docs_url="/docs" if settings.ENVIRONMENT != "production" else None,
    redoc_url="/redoc" if settings.ENVIRONMENT != "production" else None,
)

# Rate-limit middleware
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)


# ---------------------------------------------------------------------------
# Global validation-error handler — returns friendly messages, never a stack trace
# ---------------------------------------------------------------------------
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    errors = []
    for err in exc.errors():
        errors.append({"field": " -> ".join(str(l) for l in err["loc"]), "message": err["msg"]})
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": "Input validation failed", "errors": errors},
    )


# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(predict.router, prefix="/api", tags=["Predict"])
app.include_router(history.router, prefix="/api", tags=["History"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])


# ---------------------------------------------------------------------------
# Health probe
# ---------------------------------------------------------------------------
@app.get("/health", tags=["Meta"], status_code=status.HTTP_200_OK)
async def health() -> dict:
    return {"status": "ok", "version": "1.0.0"}
