import uuid
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, Query

from app.api.v1.deps import get_project_id
from app.core.database import async_session
from app.schemas.kpi import (
    KPIAlert,
    KPIAlertsResponse,
    KPIDashboardResponse,
    KPIMetric,
    KPITrendPoint,
    KPITrendResponse,
    ManagerKPI,
    HeatmapCell,
    HeatmapResponse,
    WordCloudItem,
    WordCloudResponse,
    PeriodComparisonResponse,
    PeriodMetricComparison,
)
from app.services.kpi.calculator import (
    calculate_dashboard_kpis,
    calculate_heatmap,
    calculate_kpi_trend,
    calculate_period_comparison,
    calculate_word_cloud,
    check_kpi_alerts,
)

router = APIRouter(prefix="/kpi", tags=["kpi"])


@router.get("/dashboard", response_model=KPIDashboardResponse)
async def get_kpi_dashboard(
    project_id: uuid.UUID = Depends(get_project_id),
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
            db, project_id, period_start, period_end, agent_id
        )

    return KPIDashboardResponse(
        period_start=period_start,
        period_end=period_end,
        total_calls=data["total_calls"],
        completed_calls=data["completed_calls"],
        failed_calls=data["failed_calls"],
        metrics=[KPIMetric(**m) for m in data["metrics"]],
        agents=[
            ManagerKPI(
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
    project_id: uuid.UUID = Depends(get_project_id),
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
            db, project_id, metric_name, period_start, period_end, granularity
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
    project_id: uuid.UUID = Depends(get_project_id),
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
        alerts_data = await check_kpi_alerts(db, project_id, period_start, period_end)

    alerts = [KPIAlert(**a) for a in alerts_data]
    return KPIAlertsResponse(alerts=alerts, total=len(alerts))


@router.get("/heatmap", response_model=HeatmapResponse)
async def get_kpi_heatmap(
    project_id: uuid.UUID = Depends(get_project_id),
    period_start: datetime | None = Query(default=None),
    period_end: datetime | None = Query(default=None),
):
    """Get call volume heatmap by day-of-week and hour."""
    now = datetime.utcnow()
    if not period_end:
        period_end = now
    if not period_start:
        period_start = period_end - timedelta(days=30)

    async with async_session() as db:
        cells_data = await calculate_heatmap(db, project_id, period_start, period_end)

    cells = [HeatmapCell(**c) for c in cells_data]
    max_count = max((c.count for c in cells), default=0)

    return HeatmapResponse(
        period_start=period_start,
        period_end=period_end,
        cells=cells,
        max_count=max_count,
    )


@router.get("/word-cloud", response_model=WordCloudResponse)
async def get_word_cloud(
    project_id: uuid.UUID = Depends(get_project_id),
    period_start: datetime | None = Query(default=None),
    period_end: datetime | None = Query(default=None),
    limit: int = Query(default=50, ge=10, le=100),
):
    """Get word frequency data for word cloud visualization."""
    now = datetime.utcnow()
    if not period_end:
        period_end = now
    if not period_start:
        period_start = period_end - timedelta(days=30)

    async with async_session() as db:
        items_data = await calculate_word_cloud(db, project_id, period_start, period_end, limit)

    return WordCloudResponse(
        period_start=period_start,
        period_end=period_end,
        items=[WordCloudItem(**i) for i in items_data],
    )


@router.get("/comparison", response_model=PeriodComparisonResponse)
async def get_period_comparison(
    project_id: uuid.UUID = Depends(get_project_id),
    period_start: datetime | None = Query(default=None),
    period_end: datetime | None = Query(default=None),
):
    """Compare KPIs between current period and the same-length previous period."""
    now = datetime.utcnow()
    if not period_end:
        period_end = now
    if not period_start:
        period_start = period_end - timedelta(days=30)

    async with async_session() as db:
        data = await calculate_period_comparison(db, project_id, period_start, period_end)

    return PeriodComparisonResponse(
        current_start=data["current_start"],
        current_end=data["current_end"],
        previous_start=data["previous_start"],
        previous_end=data["previous_end"],
        metrics=[PeriodMetricComparison(**m) for m in data["metrics"]],
    )
