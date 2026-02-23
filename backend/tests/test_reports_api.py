"""Tests for reports API endpoints."""

import pytest


@pytest.mark.asyncio
async def test_list_report_types(client):
    response = await client.get("/api/v1/reports/types")
    assert response.status_code == 200
    data = response.json()
    assert "calls" in data["report_types"]
    assert "managers" in data["report_types"]
    assert "json" in data["formats"]
    assert "excel" in data["formats"]
    assert "pdf" in data["formats"]
