import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class KPIMetric(BaseModel):
    """A single KPI metric with value and optional threshold."""

    name: str
    label: str
    value: float
    unit: str = ""
    threshold_min: float | None = None
    threshold_max: float | None = None
    status: str = "normal"  # normal, warning, critical


class AgentKPI(BaseModel):
    """KPI metrics for a specific agent."""

    agent_id: uuid.UUID | None
    agent_label: str
    total_calls: int
    metrics: list[KPIMetric]


class KPIDashboardResponse(BaseModel):
    """Aggregated KPI dashboard for the organization."""

    period_start: datetime
    period_end: datetime
    total_calls: int
    completed_calls: int
    failed_calls: int
    metrics: list[KPIMetric]
    agents: list[AgentKPI] = Field(default_factory=list)
    sentiment_distribution: dict[str, int] = Field(default_factory=dict)
    category_distribution: dict[str, int] = Field(default_factory=dict)


class KPITrendPoint(BaseModel):
    """A single data point for KPI trend over time."""

    date: str
    value: float


class KPITrendResponse(BaseModel):
    """KPI trend data for a specific metric over time."""

    metric_name: str
    label: str
    unit: str
    period_start: datetime
    period_end: datetime
    data: list[KPITrendPoint]


class KPIAlertRule(BaseModel):
    """Configuration for a KPI threshold alert."""

    metric_name: str
    threshold_min: float | None = None
    threshold_max: float | None = None
    severity: str = "warning"  # warning, critical


class KPIAlert(BaseModel):
    """A triggered KPI alert."""

    metric_name: str
    label: str
    current_value: float
    threshold: float
    direction: str  # above, below
    severity: str
    message: str


class KPIAlertsResponse(BaseModel):
    """List of active KPI alerts."""

    alerts: list[KPIAlert]
    total: int
