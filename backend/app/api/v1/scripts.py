import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from app.api.v1.deps import get_project_id
from app.core.database import async_session
from app.models.call import Call
from app.models.script import Script, ScriptAnalysis, ScriptStage
from app.models.transcription import Transcription
from app.schemas.script import (
    AnalyzeScriptRequest,
    ScriptAnalysisResponse,
    ScriptCreate,
    ScriptListResponse,
    ScriptResponse,
    ScriptStageCreate,
    ScriptStageResponse,
    ScriptUpdate,
)
from app.services.scripts.compliance import script_compliance_service

router = APIRouter(tags=["scripts"])


# --- Script CRUD ---


@router.post("/scripts", response_model=ScriptResponse, status_code=201)
async def create_script(payload: ScriptCreate, project_id: uuid.UUID = Depends(get_project_id)):
    """Create a new script with optional stages."""
    async with async_session() as db:
        script = Script(
            organization_id=project_id,
            name=payload.name,
            type=payload.type,
            description=payload.description,
            is_active=payload.is_active,
        )
        db.add(script)
        await db.flush()

        for stage_data in payload.stages:
            stage = ScriptStage(
                script_id=script.id,
                order=stage_data.order,
                name=stage_data.name,
                required_phrases=stage_data.required_phrases,
                forbidden_words=stage_data.forbidden_words,
                is_required=stage_data.is_required,
                max_duration_seconds=stage_data.max_duration_seconds,
            )
            db.add(stage)

        await db.commit()

        result = await db.execute(
            select(Script)
            .options(selectinload(Script.stages))
            .where(Script.id == script.id)
        )
        script = result.scalar_one()
        return ScriptResponse.model_validate(script)


@router.get("/scripts", response_model=ScriptListResponse)
async def list_scripts(
    project_id: uuid.UUID = Depends(get_project_id),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    is_active: bool | None = Query(default=None),
    type: str | None = Query(default=None),
):
    """List scripts with pagination and filters."""
    async with async_session() as db:
        query = select(Script).where(Script.organization_id == project_id)

        if is_active is not None:
            query = query.where(Script.is_active == is_active)
        if type is not None:
            query = query.where(Script.type == type)

        count_query = select(func.count()).select_from(query.subquery())
        total = (await db.execute(count_query)).scalar() or 0

        query = (
            query.options(selectinload(Script.stages))
            .order_by(Script.created_at.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        result = await db.execute(query)
        scripts = result.scalars().unique().all()

        return ScriptListResponse(
            items=[ScriptResponse.model_validate(s) for s in scripts],
            total=total,
            page=page,
            page_size=page_size,
        )


@router.get("/scripts/{script_id}", response_model=ScriptResponse)
async def get_script(script_id: uuid.UUID):
    """Get script details with all stages."""
    async with async_session() as db:
        result = await db.execute(
            select(Script)
            .options(selectinload(Script.stages))
            .where(Script.id == script_id)
        )
        script = result.scalar_one_or_none()
        if not script:
            raise HTTPException(status_code=404, detail="Script not found")
        return ScriptResponse.model_validate(script)


@router.put("/scripts/{script_id}", response_model=ScriptResponse)
async def update_script(script_id: uuid.UUID, payload: ScriptUpdate):
    """Update a script's metadata."""
    async with async_session() as db:
        result = await db.execute(
            select(Script)
            .options(selectinload(Script.stages))
            .where(Script.id == script_id)
        )
        script = result.scalar_one_or_none()
        if not script:
            raise HTTPException(status_code=404, detail="Script not found")

        update_data = payload.model_dump(exclude_unset=True)
        for field_name, value in update_data.items():
            setattr(script, field_name, value)

        await db.commit()
        await db.refresh(script)

        result = await db.execute(
            select(Script)
            .options(selectinload(Script.stages))
            .where(Script.id == script.id)
        )
        script = result.scalar_one()
        return ScriptResponse.model_validate(script)


@router.delete("/scripts/{script_id}")
async def delete_script(script_id: uuid.UUID):
    """Delete a script and all its stages."""
    async with async_session() as db:
        script = await db.get(Script, script_id)
        if not script:
            raise HTTPException(status_code=404, detail="Script not found")

        await db.delete(script)
        await db.commit()
        return {"message": "Script deleted successfully"}


# --- Script Stages ---


@router.post("/scripts/{script_id}/stages", response_model=ScriptStageResponse, status_code=201)
async def add_stage_to_script(script_id: uuid.UUID, payload: ScriptStageCreate):
    """Add a new stage to an existing script."""
    async with async_session() as db:
        script = await db.get(Script, script_id)
        if not script:
            raise HTTPException(status_code=404, detail="Script not found")

        stage = ScriptStage(
            script_id=script_id,
            order=payload.order,
            name=payload.name,
            required_phrases=payload.required_phrases,
            forbidden_words=payload.forbidden_words,
            is_required=payload.is_required,
            max_duration_seconds=payload.max_duration_seconds,
        )
        db.add(stage)
        await db.commit()
        await db.refresh(stage)

        return ScriptStageResponse.model_validate(stage)


# --- Script Compliance Analysis ---


@router.post("/calls/{call_id}/analyze-script", response_model=ScriptAnalysisResponse)
async def analyze_script_compliance(call_id: uuid.UUID, payload: AnalyzeScriptRequest):
    """Run script compliance analysis on a call's transcription."""
    async with async_session() as db:
        call = await db.get(Call, call_id)
        if not call:
            raise HTTPException(status_code=404, detail="Call not found")

        result = await db.execute(
            select(Transcription).where(Transcription.call_id == call_id)
        )
        transcription = result.scalar_one_or_none()
        if not transcription:
            raise HTTPException(
                status_code=400,
                detail="Call has no transcription yet. Please wait for transcription to complete.",
            )

        result = await db.execute(
            select(Script)
            .options(selectinload(Script.stages))
            .where(Script.id == payload.script_id)
        )
        script = result.scalar_one_or_none()
        if not script:
            raise HTTPException(status_code=404, detail="Script not found")

        if not script.is_active:
            raise HTTPException(status_code=400, detail="Script is not active")

        stages_data = [
            {
                "id": stage.id,
                "name": stage.name,
                "order": stage.order,
                "required_phrases": stage.required_phrases,
                "forbidden_words": stage.forbidden_words,
                "is_required": stage.is_required,
                "max_duration_seconds": stage.max_duration_seconds,
            }
            for stage in sorted(script.stages, key=lambda s: s.order)
        ]

        analysis_result = await script_compliance_service.analyze(
            transcription_text=transcription.full_text,
            segments=transcription.segments or [],
            script_id=script.id,
            stages=stages_data,
        )

        analysis = ScriptAnalysis(
            call_id=call_id,
            script_id=script.id,
            overall_score=analysis_result.overall_score,
            stage_results=[
                {
                    "stage_id": sr.stage_id,
                    "stage_name": sr.stage_name,
                    "passed": sr.passed,
                    "score": sr.score,
                    "matched_phrases": sr.matched_phrases,
                    "missing_phrases": sr.missing_phrases,
                    "found_forbidden_words": sr.found_forbidden_words,
                    "notes": sr.notes,
                }
                for sr in analysis_result.stage_results
            ],
            violations=[
                {
                    "stage_name": v.stage_name,
                    "type": v.type,
                    "description": v.description,
                    "severity": v.severity,
                }
                for v in analysis_result.violations
            ],
        )
        db.add(analysis)
        await db.commit()
        await db.refresh(analysis)

        return ScriptAnalysisResponse.model_validate(analysis)
