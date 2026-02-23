"""Tests for Excel export functionality."""

import pytest


def test_export_to_excel():
    from app.services.reports.excel_export import export_to_excel

    report_data = {
        "title": "Test Report",
        "period": "2026-01-01 — 2026-01-31",
        "generated_at": "2026-01-31T12:00:00",
        "summary": {
            "total_calls": 10,
            "avg_duration_seconds": 120.5,
        },
        "columns": ["date", "agent_name", "duration_seconds", "sentiment"],
        "rows": [
            {"date": "2026-01-15 10:30", "agent_name": "Alice", "duration_seconds": 180, "sentiment": "positive"},
            {"date": "2026-01-16 11:00", "agent_name": "Bob", "duration_seconds": 90, "sentiment": "neutral"},
        ],
    }

    content = export_to_excel(report_data)
    assert isinstance(content, bytes)
    assert len(content) > 0
    # XLSX magic bytes
    assert content[:2] == b"PK"


def test_export_to_excel_empty():
    from app.services.reports.excel_export import export_to_excel

    report_data = {
        "title": "Empty Report",
        "period": "2026-01-01 — 2026-01-31",
        "summary": {},
        "columns": [],
        "rows": [],
    }

    content = export_to_excel(report_data)
    assert isinstance(content, bytes)
    assert len(content) > 0
