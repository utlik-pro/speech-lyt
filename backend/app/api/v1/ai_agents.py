"""AI Agents API — CRUD, pipeline execution, prompt management."""

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import delete, select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.deps import get_project_id
from app.core.database import async_session
from app.models.ai_agent import AIAgent, AIAgentPrompt, AIAgentRun
from app.schemas.ai_agent import (
    AIAgentCreate,
    AIAgentListResponse,
    AIAgentPromptCreate,
    AIAgentPromptResponse,
    AIAgentPromptUpdate,
    AIAgentResponse,
    AIAgentRunListResponse,
    AIAgentRunResponse,
    AIAgentUpdate,
    DefaultPromptResponse,
)
from app.services.ai_agents.defaults import DEFAULT_PROMPTS

router = APIRouter(prefix="/ai-agents", tags=["ai-agents"])


# ── CRUD ────────────────────────────────────────────────────────────────────


@router.get("", response_model=AIAgentListResponse)
async def list_ai_agents(
    project_id: uuid.UUID = Depends(get_project_id),
):
    """List all AI agents for the organization."""
    async with async_session() as db:
        result = await db.execute(
            select(AIAgent).where(AIAgent.organization_id == project_id)
            .order_by(AIAgent.created_at.desc())
        )
        agents = result.scalars().all()
        return AIAgentListResponse(items=agents, total=len(agents))


@router.post("", response_model=AIAgentResponse, status_code=201)
async def create_ai_agent(
    data: AIAgentCreate,
    project_id: uuid.UUID = Depends(get_project_id),
):
    """Create a new AI agent."""
    async with async_session() as db:
        agent = AIAgent(
            organization_id=project_id,
            name=data.name,
            description=data.description,
            agent_type=data.agent_type,
            model_name=data.model_name,
            temperature=data.temperature,
            max_tokens=data.max_tokens,
            pipeline_steps=[s.model_dump() for s in data.pipeline_steps],
        )
        db.add(agent)
        await db.commit()
        await db.refresh(agent)
        return agent


@router.get("/{agent_id}", response_model=AIAgentResponse)
async def get_ai_agent(agent_id: uuid.UUID):
    """Get AI agent details."""
    async with async_session() as db:
        agent = await db.get(AIAgent, agent_id)
        if not agent:
            raise HTTPException(status_code=404, detail="AI agent not found")
        return agent


@router.put("/{agent_id}", response_model=AIAgentResponse)
async def update_ai_agent(agent_id: uuid.UUID, data: AIAgentUpdate):
    """Update AI agent configuration."""
    async with async_session() as db:
        agent = await db.get(AIAgent, agent_id)
        if not agent:
            raise HTTPException(status_code=404, detail="AI agent not found")

        for field, value in data.model_dump(exclude_unset=True).items():
            if field == "pipeline_steps" and value is not None:
                setattr(agent, field, [s if isinstance(s, dict) else s.model_dump() for s in value])
            else:
                setattr(agent, field, value)

        await db.commit()
        await db.refresh(agent)
        return agent


@router.delete("/{agent_id}", status_code=204)
async def delete_ai_agent(agent_id: uuid.UUID):
    """Delete an AI agent."""
    async with async_session() as db:
        agent = await db.get(AIAgent, agent_id)
        if not agent:
            raise HTTPException(status_code=404, detail="AI agent not found")
        await db.delete(agent)
        await db.commit()


# ── Prompts ─────────────────────────────────────────────────────────────────


@router.get("/{agent_id}/prompts", response_model=list[AIAgentPromptResponse])
async def list_prompts(agent_id: uuid.UUID):
    """List all custom prompts for an AI agent."""
    async with async_session() as db:
        result = await db.execute(
            select(AIAgentPrompt).where(AIAgentPrompt.ai_agent_id == agent_id)
        )
        return result.scalars().all()


@router.post("/{agent_id}/prompts", response_model=AIAgentPromptResponse, status_code=201)
async def create_prompt(agent_id: uuid.UUID, data: AIAgentPromptCreate):
    """Create or replace a custom prompt for a step type."""
    async with async_session() as db:
        agent = await db.get(AIAgent, agent_id)
        if not agent:
            raise HTTPException(status_code=404, detail="AI agent not found")

        # Deactivate existing prompt for this step_type
        existing = await db.execute(
            select(AIAgentPrompt).where(
                AIAgentPrompt.ai_agent_id == agent_id,
                AIAgentPrompt.step_type == data.step_type,
                AIAgentPrompt.is_active == True,
            )
        )
        for old in existing.scalars():
            old.is_active = False

        prompt = AIAgentPrompt(
            ai_agent_id=agent_id,
            step_type=data.step_type,
            system_prompt=data.system_prompt,
            user_prompt_template=data.user_prompt_template,
            version=(old.version + 1 if existing.scalars().first() else 1),
        )
        db.add(prompt)
        await db.commit()
        await db.refresh(prompt)
        return prompt


@router.delete("/{agent_id}/prompts/{prompt_id}", status_code=204)
async def delete_prompt(agent_id: uuid.UUID, prompt_id: uuid.UUID):
    """Delete a custom prompt (reverts to default)."""
    async with async_session() as db:
        prompt = await db.get(AIAgentPrompt, prompt_id)
        if not prompt or prompt.ai_agent_id != agent_id:
            raise HTTPException(status_code=404, detail="Prompt not found")
        await db.delete(prompt)
        await db.commit()


# ── Pipeline Execution ──────────────────────────────────────────────────────


@router.post("/{agent_id}/run/{call_id}", response_model=AIAgentRunResponse)
async def run_pipeline(agent_id: uuid.UUID, call_id: uuid.UUID):
    """Run an AI agent's pipeline on a specific call."""
    async with async_session() as db:
        agent = await db.get(AIAgent, agent_id)
        if not agent:
            raise HTTPException(status_code=404, detail="AI agent not found")
        if not agent.is_active:
            raise HTTPException(status_code=400, detail="AI agent is inactive")

        from app.services.ai_agents.pipeline import PipelineExecutor
        executor = PipelineExecutor(db)
        run = await executor.execute(agent, call_id)
        return run


@router.get("/{agent_id}/runs", response_model=AIAgentRunListResponse)
async def list_runs(
    agent_id: uuid.UUID,
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
):
    """List pipeline runs for an AI agent."""
    async with async_session() as db:
        total = (await db.execute(
            select(func.count()).select_from(AIAgentRun).where(AIAgentRun.ai_agent_id == agent_id)
        )).scalar() or 0

        result = await db.execute(
            select(AIAgentRun).where(AIAgentRun.ai_agent_id == agent_id)
            .order_by(AIAgentRun.created_at.desc())
            .offset(offset).limit(limit)
        )
        runs = result.scalars().all()
        return AIAgentRunListResponse(items=runs, total=total)


@router.get("/runs/{run_id}", response_model=AIAgentRunResponse)
async def get_run(run_id: uuid.UUID):
    """Get details of a specific pipeline run."""
    async with async_session() as db:
        run = await db.get(AIAgentRun, run_id)
        if not run:
            raise HTTPException(status_code=404, detail="Run not found")
        return run


# ── Coaching ────────────────────────────────────────────────────────────────


@router.post("/{agent_id}/coach/{manager_id}")
async def generate_coaching(
    agent_id: uuid.UUID,
    manager_id: uuid.UUID,
    period_days: int = Query(default=30, ge=7, le=365),
):
    """Generate coaching insights for a manager using an AI agent."""
    async with async_session() as db:
        agent = await db.get(AIAgent, agent_id)
        if not agent:
            raise HTTPException(status_code=404, detail="AI agent not found")

        from app.services.ai_agents.coaching import CoachingEngine
        engine = CoachingEngine(db)
        insights = await engine.generate_insights(agent, manager_id, period_days)

        return {
            "manager_id": str(manager_id),
            "ai_agent_id": str(agent_id),
            "insights_count": len(insights),
            "insights": [
                {
                    "id": str(i.id),
                    "insight_type": i.insight_type,
                    "title": i.title,
                    "description": i.description,
                    "priority": i.priority,
                }
                for i in insights
            ],
        }


# ── Default Prompts ─────────────────────────────────────────────────────────


@router.get("/default-prompts", response_model=list[DefaultPromptResponse])
async def get_default_prompts():
    """Get all default prompt templates."""
    return [
        DefaultPromptResponse(
            step_type=step_type,
            system_prompt=prompts["system_prompt"],
            user_prompt_template=prompts["user_prompt_template"],
        )
        for step_type, prompts in DEFAULT_PROMPTS.items()
    ]
