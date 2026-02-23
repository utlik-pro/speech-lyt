"""Managers API — CRUD, leaderboard, and per-manager statistics."""

import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func

from app.api.v1.deps import get_project_id
from app.core.database import async_session
from app.models.manager import Manager
from app.schemas.manager import (
    ManagerCreate,
    ManagerLeaderboardResponse,
    ManagerListResponse,
    ManagerResponse,
    ManagerStatsResponse,
)
from app.services.managers.stats import get_manager_leaderboard, get_manager_stats

router = APIRouter(prefix="/managers", tags=["managers"])


@router.get("", response_model=ManagerListResponse)
async def list_managers(project_id: uuid.UUID = Depends(get_project_id)):
    """List all managers for the organization."""
    async with async_session() as db:
        query = (
            select(Manager)
            .where(Manager.organization_id == project_id, Manager.is_active == True)
            .order_by(Manager.name)
        )
        result = await db.execute(query)
        managers = result.scalars().all()

        return ManagerListResponse(
            items=[ManagerResponse.model_validate(a) for a in managers],
            total=len(managers),
        )


@router.post("", response_model=ManagerResponse, status_code=201)
async def create_manager(payload: ManagerCreate, project_id: uuid.UUID = Depends(get_project_id)):
    """Create a new manager."""
    async with async_session() as db:
        manager = Manager(
            organization_id=project_id,
            name=payload.name,
            email=payload.email,
            team=payload.team,
        )
        db.add(manager)
        await db.commit()
        await db.refresh(manager)
        return ManagerResponse.model_validate(manager)


@router.get("/leaderboard", response_model=ManagerLeaderboardResponse)
async def manager_leaderboard(
    project_id: uuid.UUID = Depends(get_project_id),
    days: int = Query(default=30, ge=1, le=365),
):
    """Get manager leaderboard with KPI-based ranking."""
    period_end = datetime.now(timezone.utc)
    period_start = period_end - timedelta(days=days)

    async with async_session() as db:
        entries = await get_manager_leaderboard(db, project_id, period_start, period_end)
        return ManagerLeaderboardResponse(
            period_start=period_start,
            period_end=period_end,
            entries=entries,
        )


@router.get("/{manager_id}/info", response_model=ManagerResponse)
async def manager_info(manager_id: uuid.UUID):
    """Get basic manager info (lightweight, no stats computation)."""
    async with async_session() as db:
        manager = await db.get(Manager, manager_id)
        if not manager:
            raise HTTPException(status_code=404, detail="Manager not found")
        return ManagerResponse.model_validate(manager)


@router.get("/{manager_id}", response_model=ManagerStatsResponse)
async def manager_detail(
    manager_id: uuid.UUID,
    project_id: uuid.UUID = Depends(get_project_id),
    days: int = Query(default=30, ge=1, le=365),
):
    """Get detailed statistics for a specific manager."""
    period_end = datetime.now(timezone.utc)
    period_start = period_end - timedelta(days=days)

    async with async_session() as db:
        stats = await get_manager_stats(db, manager_id, project_id, period_start, period_end)
        if not stats:
            raise HTTPException(status_code=404, detail="Manager not found")
        return ManagerStatsResponse(**stats)
