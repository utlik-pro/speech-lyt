import uuid
from datetime import datetime, timedelta

from fastapi import APIRouter, Query

from app.core.database import async_session
from app.schemas.kpi import (
    KPIAlert,
    KPIAlertsResponse,
    KPIDashboardResponse,
    KPIMetric,
    KPITrendPoint,
    KPITrendResponse,
    AgentKPI,
)
from app.services.kpi.calculator import calculate_dashboard_kpis, calculate_kpi_trend, check_kpi_alerts

router = APIRouter(prefix="/kpi", tags=["kpi"])

# Temporary hardcoded org_id until auth is implemented
TEMP_ORG_ID = uuid.UUID("00000000-0000-0000-0000-000000000001")


@router.get("/dashboard", response_model=KPIDashboardResponse)
async def get_kpi_dashboard(
    period_start: datetime | None = Query(default=None, description="Start of period (default: 30 days ago)"),
    period_end: datetime | None = Query(default=None, description="End of period (default: now)"),
    agent_id: uuid.UUID | None = Query(default=None, description="Filter by agent ID"),
):
    """Get aggregated KPI dashboard metrics."""
    now = datetime.utcnow()
    if not period_end:
        period_end = now
    if not period_start:
        period_start = period_end - timedelta(days=30)

    async with async_session() as db:
        data = await calculate_dashboard_kpis(
            db, TEMP_ORG_ID, period_start, period_end, agent_id
        )

    return KPIDashboardResponse(
        period_start=period_start,
        period_end=period_end,
        total_calls=data["total_calls"],
        completed_calls=data["completed_calls"],
        failed_calls=data["failed_calls"],
        metrics=[KPIMetric(**m) for m in data["metrics"]],
        agents=[
            AgentKPI(
                agent_id=a["agent_id"],
                agent_label=a["agent_label"],
                total_calls=a["total_calls"],
                metrics=[KPIMetric(**m) for m in a["metrics"]],
            )
            for a in data["agents"]
        ],
        sentiment_distribution=data["sentiment_distribution"],
        category_distribution=data["category_distribution"],
    )


@router.get("/trend/{metric_name}", response_model=KPITrendResponse)
async def get_kpi_trend(
    metric_name: str,
    period_start: datetime | None = Query(default=None),
    period_end: datetime | None = Query(default=None),
    granularity: str = Query(default="day", regex="^(day|week|month)$"),
):
    """Get trend data for a specific KPI metric over time."""
    now = datetime.utcnow()
    if not period_end:
        period_end = now
    if not period_start:
        period_start = period_end - timedelta(days=30)

    labels = {
        "aht": ("Average Handle Time", "sec"),
        "call_volume": ("Call Volume", ""),
        "avg_script_score": ("Avg Script Compliance", "%"),
    }
    label, unit = labels.get(metric_name, (metric_name, ""))

    async with async_session() as db:
        data = await calculate_kpi_trend(
            db, TEMP_ORG_ID, metric_name, period_start, period_end, granularity
        )

    return KPITrendResponse(
        metric_name=metric_name,
        label=label,
        unit=unit,
        period_start=period_start,
        period_end=period_end,
        data=[KPITrendPoint(**d) for d in data],
    )


@router.get("/alerts", response_model=KPIAlertsResponse)
async def get_kpi_alerts(
    period_start: datetime | None = Query(default=None),
    period_end: datetime | None = Query(default=None),
):
    """Get active KPI alerts based on threshold violations."""
    now = datetime.utcnow()
    if not period_end:
        period_end = now
    if not period_start:
        period_start = period_end - timedelta(days=7)

    async with async_session() as db:
        alerts_data = await check_kpi_alerts(db, TEMP_ORG_ID, period_start, period_end)

    alerts = [KPIAlert(**a) for a in alerts_data]
    return KPIAlertsResponse(alerts=alerts, total=len(alerts))
