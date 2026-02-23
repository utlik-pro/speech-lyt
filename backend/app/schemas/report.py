import uuid
from datetime import datetime
from enum import Enum

from pydantic import BaseModel


class ReportType(str, Enum):
    CALLS = "calls"
    MANAGERS = "managers"


class ReportFormat(str, Enum):
    JSON = "json"
    EXCEL = "excel"
    PDF = "pdf"


class ReportRequest(BaseModel):
    report_type: ReportType = ReportType.CALLS
    date_from: datetime
    date_to: datetime
    agent_id: uuid.UUID | None = None
    format: ReportFormat = ReportFormat.JSON


class ReportSummary(BaseModel):
    total_calls: int = 0
    total_duration_seconds: int = 0
    avg_duration_seconds: float = 0
    sentiment_distribution: dict[str, int] = {}


class ReportResponse(BaseModel):
    title: str
    period: str
    generated_at: str
    summary: dict
    columns: list[str]
    rows: list[dict]
