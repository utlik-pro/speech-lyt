"""Reports API — generate and export reports in JSON, Excel, PDF."""

import uuid

from fastapi import APIRouter, Depends, Query
from fastapi.responses import Response

from app.api.v1.deps import get_project_id
from app.core.database import async_session
from app.schemas.report import ReportFormat, ReportRequest, ReportResponse, ReportType
from app.services.reports.generator import ReportGenerator

router = APIRouter(prefix="/reports", tags=["reports"])


@router.post("", response_model=ReportResponse)
async def generate_report(
    payload: ReportRequest,
    project_id: uuid.UUID = Depends(get_project_id),
):
    """Generate a report and return as JSON."""
    async with async_session() as db:
        gen = ReportGenerator(db)
        if payload.report_type == ReportType.CALLS:
            data = await gen.generate_calls_report(
                organization_id=project_id,
                date_from=payload.date_from,
                date_to=payload.date_to,
                agent_id=payload.agent_id,
            )
        else:
            data = await gen.generate_managers_report(
                organization_id=project_id,
                date_from=payload.date_from,
                date_to=payload.date_to,
            )
        return ReportResponse(**data)


@router.post("/export")
async def export_report(
    payload: ReportRequest,
    project_id: uuid.UUID = Depends(get_project_id),
):
    """Generate and export a report as Excel or PDF. Defaults to JSON."""
    async with async_session() as db:
        gen = ReportGenerator(db)
        if payload.report_type == ReportType.CALLS:
            data = await gen.generate_calls_report(
                organization_id=project_id,
                date_from=payload.date_from,
                date_to=payload.date_to,
                agent_id=payload.agent_id,
            )
        else:
            data = await gen.generate_managers_report(
                organization_id=project_id,
                date_from=payload.date_from,
                date_to=payload.date_to,
            )

    if payload.format == ReportFormat.EXCEL:
        from app.services.reports.excel_export import export_to_excel

        content = export_to_excel(data)
        filename = f"{data['title'].replace(' ', '_')}_{data['period'].replace(' ', '')}.xlsx"
        return Response(
            content=content,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'},
        )

    if payload.format == ReportFormat.PDF:
        from app.services.reports.pdf_export import export_to_pdf

        content = export_to_pdf(data)
        filename = f"{data['title'].replace(' ', '_')}_{data['period'].replace(' ', '')}.pdf"
        return Response(
            content=content,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'},
        )

    # Default: JSON
    return ReportResponse(**data)


@router.get("/types")
async def list_report_types():
    """List available report types and formats."""
    return {
        "report_types": [t.value for t in ReportType],
        "formats": [f.value for f in ReportFormat],
    }
