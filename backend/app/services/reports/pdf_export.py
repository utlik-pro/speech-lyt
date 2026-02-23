"""PDF export using reportlab."""

import io
import logging
from datetime import datetime

logger = logging.getLogger(__name__)


def export_to_pdf(report_data: dict) -> bytes:
    """Convert report data dict to a PDF file in memory."""
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import A4, landscape
    from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
    from reportlab.lib.units import cm
    from reportlab.platypus import (
        Paragraph,
        SimpleDocTemplate,
        Spacer,
        Table,
        TableStyle,
    )

    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=landscape(A4), topMargin=1.5 * cm, bottomMargin=1.5 * cm)
    styles = getSampleStyleSheet()
    elements = []

    # Title
    title_style = ParagraphStyle(
        "ReportTitle", parent=styles["Heading1"], fontSize=18, spaceAfter=12
    )
    elements.append(Paragraph(report_data.get("title", "Report"), title_style))
    elements.append(Paragraph(f"Period: {report_data.get('period', '')}", styles["Normal"]))
    elements.append(Paragraph(f"Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}", styles["Normal"]))
    elements.append(Spacer(1, 0.5 * cm))

    # Summary
    summary = report_data.get("summary", {})
    if summary:
        elements.append(Paragraph("Summary", styles["Heading2"]))
        for key, value in summary.items():
            label = key.replace("_", " ").title()
            elements.append(Paragraph(f"<b>{label}:</b> {value}", styles["Normal"]))
        elements.append(Spacer(1, 0.5 * cm))

    # Data table
    columns = report_data.get("columns", [])
    rows = report_data.get("rows", [])
    if columns and rows:
        elements.append(Paragraph("Details", styles["Heading2"]))

        # Build table data
        header_row = [col.replace("_", " ").title() for col in columns]
        table_data = [header_row]

        for row_data in rows:
            table_row = []
            for col in columns:
                val = row_data.get(col, "")
                if isinstance(val, dict):
                    val = str(val)
                if isinstance(val, float):
                    val = f"{val:.1f}"
                if val is None:
                    val = ""
                # Truncate long text for PDF
                val = str(val)
                if len(val) > 60:
                    val = val[:57] + "..."
                table_row.append(val)
            table_data.append(table_row)

        # Calculate column widths
        page_width = landscape(A4)[0] - 3 * cm
        n_cols = len(columns)
        col_width = page_width / n_cols

        table = Table(table_data, colWidths=[col_width] * n_cols)
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#2563EB")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, 0), 8),
            ("FONTSIZE", (0, 1), (-1, -1), 7),
            ("BOTTOMPADDING", (0, 0), (-1, 0), 8),
            ("BACKGROUND", (0, 1), (-1, -1), colors.white),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F3F4F6")]),
        ]))
        elements.append(table)

    doc.build(elements)
    buf.seek(0)
    return buf.getvalue()
