from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.analytics import router as analytics_router
from app.api.v1.api_keys import router as api_keys_router
from app.api.v1.calls import router as calls_router
from app.api.v1.kpi import router as kpi_router
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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(RateLimitMiddleware, max_requests=100, window_seconds=60)


# API routers
app.include_router(calls_router, prefix=settings.API_PREFIX)
app.include_router(scripts_router, prefix=settings.API_PREFIX)
app.include_router(analytics_router, prefix=settings.API_PREFIX)
app.include_router(kpi_router, prefix=settings.API_PREFIX)
app.include_router(webhooks_router, prefix=settings.API_PREFIX)
app.include_router(api_keys_router, prefix=settings.API_PREFIX)


@app.get("/health")
async def health():
    return {"status": "ok", "service": settings.APP_NAME, "version": settings.APP_VERSION}


@app.get(f"{settings.API_PREFIX}/ping")
async def ping():
    return {"message": "pong"}
