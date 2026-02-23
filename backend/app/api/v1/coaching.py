"""Coaching API — manage coaching insights for managers."""

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.deps import get_project_id
from app.core.database import async_session
from app.models.coaching import CoachingInsight
from app.schemas.ai_agent import CoachingInsightListResponse, CoachingInsightResponse

router = APIRouter(prefix="/coaching", tags=["coaching"])


@router.get("/insights", response_model=CoachingInsightListResponse)
async def list_coaching_insights(
    project_id: uuid.UUID = Depends(get_project_id),
    manager_id: uuid.UUID | None = Query(default=None),
    status: str | None = Query(default=None),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
):
    """List coaching insights, optionally filtered by manager and status."""
    async with async_session() as db:
        filters = [CoachingInsight.organization_id == project_id]
        if manager_id:
            filters.append(CoachingInsight.manager_id == manager_id)
        if status:
            filters.append(CoachingInsight.status == status)

        total = (await db.execute(
            select(func.count()).select_from(CoachingInsight).where(*filters)
        )).scalar() or 0

        result = await db.execute(
            select(CoachingInsight).where(*filters)
            .order_by(CoachingInsight.created_at.desc())
            .offset(offset).limit(limit)
        )
        insights = result.scalars().all()
        return CoachingInsightListResponse(items=insights, total=total)


@router.get("/insights/{insight_id}", response_model=CoachingInsightResponse)
async def get_coaching_insight(insight_id: uuid.UUID):
    """Get a specific coaching insight."""
    async with async_session() as db:
        insight = await db.get(CoachingInsight, insight_id)
        if not insight:
            raise HTTPException(status_code=404, detail="Insight not found")
        return insight


@router.put("/insights/{insight_id}/acknowledge")
async def acknowledge_insight(insight_id: uuid.UUID):
    """Mark a coaching insight as acknowledged."""
    async with async_session() as db:
        insight = await db.get(CoachingInsight, insight_id)
        if not insight:
            raise HTTPException(status_code=404, detail="Insight not found")
        insight.status = "acknowledged"
        await db.commit()
        return {"status": "acknowledged"}


@router.put("/insights/{insight_id}/dismiss")
async def dismiss_insight(insight_id: uuid.UUID):
    """Dismiss a coaching insight."""
    async with async_session() as db:
        insight = await db.get(CoachingInsight, insight_id)
        if not insight:
            raise HTTPException(status_code=404, detail="Insight not found")
        insight.status = "dismissed"
        await db.commit()
        return {"status": "dismissed"}


@router.put("/insights/{insight_id}/resolve")
async def resolve_insight(insight_id: uuid.UUID):
    """Mark a coaching insight as resolved."""
    async with async_session() as db:
        insight = await db.get(CoachingInsight, insight_id)
        if not insight:
            raise HTTPException(status_code=404, detail="Insight not found")
        insight.status = "resolved"
        await db.commit()
        return {"status": "resolved"}
