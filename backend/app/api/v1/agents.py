"""Agents API — CRUD, leaderboard, and per-agent statistics."""

import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func

from app.api.v1.deps import get_project_id
from app.core.database import async_session
from app.models.agent import Agent
from app.schemas.agent import (
    AgentCreate,
    AgentLeaderboardResponse,
    AgentListResponse,
    AgentResponse,
    AgentStatsResponse,
)
from app.services.agents.stats import get_agent_leaderboard, get_agent_stats

router = APIRouter(prefix="/agents", tags=["agents"])


@router.get("", response_model=AgentListResponse)
async def list_agents(project_id: uuid.UUID = Depends(get_project_id)):
    """List all agents for the organization."""
    async with async_session() as db:
        query = (
            select(Agent)
            .where(Agent.organization_id == project_id, Agent.is_active == True)
            .order_by(Agent.name)
        )
        result = await db.execute(query)
        agents = result.scalars().all()

        return AgentListResponse(
            items=[AgentResponse.model_validate(a) for a in agents],
            total=len(agents),
        )


@router.post("", response_model=AgentResponse, status_code=201)
async def create_agent(payload: AgentCreate, project_id: uuid.UUID = Depends(get_project_id)):
    """Create a new agent."""
    async with async_session() as db:
        agent = Agent(
            organization_id=project_id,
            name=payload.name,
            email=payload.email,
            team=payload.team,
        )
        db.add(agent)
        await db.commit()
        await db.refresh(agent)
        return AgentResponse.model_validate(agent)


@router.get("/leaderboard", response_model=AgentLeaderboardResponse)
async def agent_leaderboard(
    project_id: uuid.UUID = Depends(get_project_id),
    days: int = Query(default=30, ge=1, le=365),
):
    """Get agent leaderboard with KPI-based ranking."""
    period_end = datetime.now(timezone.utc)
    period_start = period_end - timedelta(days=days)

    async with async_session() as db:
        entries = await get_agent_leaderboard(db, project_id, period_start, period_end)
        return AgentLeaderboardResponse(
            period_start=period_start,
            period_end=period_end,
            entries=entries,
        )


@router.get("/{agent_id}/info", response_model=AgentResponse)
async def agent_info(agent_id: uuid.UUID):
    """Get basic agent info (lightweight, no stats computation)."""
    async with async_session() as db:
        agent = await db.get(Agent, agent_id)
        if not agent:
            raise HTTPException(status_code=404, detail="Agent not found")
        return AgentResponse.model_validate(agent)


@router.get("/{agent_id}", response_model=AgentStatsResponse)
async def agent_detail(
    agent_id: uuid.UUID,
    project_id: uuid.UUID = Depends(get_project_id),
    days: int = Query(default=30, ge=1, le=365),
):
    """Get detailed statistics for a specific agent."""
    period_end = datetime.now(timezone.utc)
    period_start = period_end - timedelta(days=days)

    async with async_session() as db:
        stats = await get_agent_stats(db, agent_id, project_id, period_start, period_end)
        if not stats:
            raise HTTPException(status_code=404, detail="Agent not found")
        return AgentStatsResponse(**stats)
