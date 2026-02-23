"""Tests for PDF export functionality."""

import pytest


def test_export_to_pdf():
    from app.services.reports.pdf_export import export_to_pdf

    report_data = {
        "title": "Test PDF Report",
        "period": "2026-01-01 — 2026-01-31",
        "generated_at": "2026-01-31T12:00:00",
        "summary": {
            "total_calls": 5,
            "avg_duration_seconds": 200.0,
        },
        "columns": ["date", "agent_name", "duration_seconds"],
        "rows": [
            {"date": "2026-01-15", "agent_name": "Alice", "duration_seconds": 300},
            {"date": "2026-01-16", "agent_name": "Bob", "duration_seconds": 100},
        ],
    }

    content = export_to_pdf(report_data)
    assert isinstance(content, bytes)
    assert len(content) > 0
    # PDF magic bytes
    assert content[:5] == b"%PDF-"


def test_export_to_pdf_empty():
    from app.services.reports.pdf_export import export_to_pdf

    report_data = {
        "title": "Empty PDF Report",
        "period": "2026-02-01 — 2026-02-28",
        "summary": {},
        "columns": [],
        "rows": [],
    }

    content = export_to_pdf(report_data)
    assert isinstance(content, bytes)
    assert content[:5] == b"%PDF-"
