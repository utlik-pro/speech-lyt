from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.managers import router as managers_router
from app.api.v1.ai_agents import router as ai_agents_router
from app.api.v1.alerts import router as alerts_router
from app.api.v1.coaching import router as coaching_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.api_keys import router as api_keys_router
from app.api.v1.auth import router as auth_router
from app.api.v1.integrations import router as integrations_router
from app.api.v1.reports import router as reports_router
from app.api.v1.calls import router as calls_router
from app.api.v1.kpi import router as kpi_router
from app.api.v1.projects import router as projects_router
from app.api.v1.qa import router as qa_router
from app.api.v1.scripts import router as scripts_router
from app.api.v1.webhooks import router as webhooks_router
from app.core.config import settings
from app.middleware.rate_limit import RateLimitMiddleware

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    docs_url=f"{settings.API_PREFIX}/docs",
    openapi_url=f"{settings.API_PREFIX}/openapi.json",
)


@app.on_event("startup")
async def on_startup():
    """Create tables if they don't exist (for cloud deployments without alembic)."""
    from app.core.database import engine
    from app.models import Base  # noqa: F401
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Range", "Accept-Ranges", "Content-Length"],
)

app.add_middleware(RateLimitMiddleware, max_requests=100, window_seconds=60)


# API routers
app.include_router(auth_router, prefix=settings.API_PREFIX)
app.include_router(projects_router, prefix=settings.API_PREFIX)
app.include_router(calls_router, prefix=settings.API_PREFIX)
app.include_router(managers_router, prefix=settings.API_PREFIX)
app.include_router(scripts_router, prefix=settings.API_PREFIX)
app.include_router(analytics_router, prefix=settings.API_PREFIX)
app.include_router(kpi_router, prefix=settings.API_PREFIX)
app.include_router(qa_router, prefix=settings.API_PREFIX)
app.include_router(alerts_router, prefix=settings.API_PREFIX)
app.include_router(webhooks_router, prefix=settings.API_PREFIX)
app.include_router(api_keys_router, prefix=settings.API_PREFIX)
app.include_router(integrations_router, prefix=settings.API_PREFIX)
app.include_router(reports_router, prefix=settings.API_PREFIX)
app.include_router(ai_agents_router, prefix=settings.API_PREFIX)
app.include_router(coaching_router, prefix=settings.API_PREFIX)


@app.get("/health")
async def health():
    return {"status": "ok", "service": settings.APP_NAME, "version": settings.APP_VERSION}


@app.post("/api/v1/seed-demo")
async def seed_demo():
    """Run demo seed (one-time use, remove after seeding)."""
    from app.scripts.seed_demo import seed
    await seed()
    return {"status": "seeded"}


@app.get(f"{settings.API_PREFIX}/ping")
async def ping():
    return {"message": "pong"}
