"""Tests for Pydantic schemas validation."""

import uuid
from datetime import datetime

import pytest


def test_integration_create_schema():
    from app.schemas.integration import IntegrationCreate

    data = IntegrationCreate(
        integration_type="asterisk",
        name="My Asterisk",
        credentials={"api_url": "http://localhost:8088"},
    )
    assert data.integration_type.value == "asterisk"
    assert data.name == "My Asterisk"
    assert data.is_active is True


def test_report_request_schema():
    from app.schemas.report import ReportFormat, ReportRequest, ReportType

    data = ReportRequest(
        report_type=ReportType.CALLS,
        date_from=datetime(2026, 1, 1),
        date_to=datetime(2026, 1, 31),
        format=ReportFormat.EXCEL,
    )
    assert data.report_type == ReportType.CALLS
    assert data.format == ReportFormat.EXCEL
    assert data.agent_id is None


def test_report_request_with_agent():
    from app.schemas.report import ReportRequest

    agent_id = uuid.uuid4()
    data = ReportRequest(
        date_from=datetime(2026, 1, 1),
        date_to=datetime(2026, 1, 31),
        agent_id=agent_id,
    )
    assert data.agent_id == agent_id
    assert data.format.value == "json"  # default


def test_organization_create_schema():
    from app.schemas.organization import OrganizationCreate

    data = OrganizationCreate(name="Test Org")
    assert data.name == "Test Org"
    assert data.plan == "free"


def test_team_create_schema():
    from app.schemas.team import TeamCreate

    data = TeamCreate(name="Support Team")
    assert data.name == "Support Team"
    assert data.supervisor_id is None
