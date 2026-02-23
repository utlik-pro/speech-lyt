import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.deps import get_project_id
from app.core.database import get_db
from app.models.qa import QAEvaluation, QAScorecard
from app.schemas.qa import (
    EvaluateRequest,
    QAEvaluationListResponse,
    QAEvaluationResponse,
    QAScorecardCreate,
    QAScorecardListResponse,
    QAScorecardResponse,
    QAScorecardUpdate,
)
from app.services.qa.evaluator import auto_evaluate

router = APIRouter(prefix="/qa", tags=["qa"])


# --- Scorecards ---


@router.get("/scorecards", response_model=QAScorecardListResponse)
async def list_scorecards(
    organization_id: uuid.UUID = Depends(get_project_id),
    db: AsyncSession = Depends(get_db),
):
    q = select(QAScorecard).where(
        QAScorecard.organization_id == organization_id
    ).order_by(QAScorecard.created_at.desc())
    result = await db.execute(q)
    items = result.scalars().all()

    count_q = select(func.count()).select_from(QAScorecard).where(
        QAScorecard.organization_id == organization_id
    )
    total = (await db.execute(count_q)).scalar() or 0

    return QAScorecardListResponse(
        items=[QAScorecardResponse.model_validate(s) for s in items],
        total=total,
    )


@router.post("/scorecards", response_model=QAScorecardResponse, status_code=201)
async def create_scorecard(
    payload: QAScorecardCreate,
    organization_id: uuid.UUID = Depends(get_project_id),
    db: AsyncSession = Depends(get_db),
):
    scorecard = QAScorecard(
        organization_id=organization_id,
        name=payload.name,
        description=payload.description,
        criteria=[c.model_dump() for c in payload.criteria],
    )
    db.add(scorecard)
    await db.commit()
    await db.refresh(scorecard)
    return QAScorecardResponse.model_validate(scorecard)


@router.get("/scorecards/{scorecard_id}", response_model=QAScorecardResponse)
async def get_scorecard(
    scorecard_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    scorecard = await db.get(QAScorecard, scorecard_id)
    if not scorecard:
        raise HTTPException(status_code=404, detail="Scorecard not found")
    return QAScorecardResponse.model_validate(scorecard)


@router.put("/scorecards/{scorecard_id}", response_model=QAScorecardResponse)
async def update_scorecard(
    scorecard_id: uuid.UUID,
    payload: QAScorecardUpdate,
    db: AsyncSession = Depends(get_db),
):
    scorecard = await db.get(QAScorecard, scorecard_id)
    if not scorecard:
        raise HTTPException(status_code=404, detail="Scorecard not found")

    if payload.name is not None:
        scorecard.name = payload.name
    if payload.description is not None:
        scorecard.description = payload.description
    if payload.is_active is not None:
        scorecard.is_active = payload.is_active
    if payload.criteria is not None:
        scorecard.criteria = [c.model_dump() for c in payload.criteria]

    await db.commit()
    await db.refresh(scorecard)
    return QAScorecardResponse.model_validate(scorecard)


@router.delete("/scorecards/{scorecard_id}", status_code=204)
async def delete_scorecard(
    scorecard_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    scorecard = await db.get(QAScorecard, scorecard_id)
    if not scorecard:
        raise HTTPException(status_code=404, detail="Scorecard not found")
    await db.delete(scorecard)
    await db.commit()


# --- Evaluations ---


@router.post("/evaluate/{call_id}", response_model=QAEvaluationResponse)
async def evaluate_call(
    call_id: uuid.UUID,
    payload: EvaluateRequest,
    db: AsyncSession = Depends(get_db),
):
    scorecard = await db.get(QAScorecard, payload.scorecard_id)
    if not scorecard:
        raise HTTPException(status_code=404, detail="Scorecard not found")

    evaluation = await auto_evaluate(db, call_id, scorecard)
    await db.commit()
    await db.refresh(evaluation)
    return QAEvaluationResponse.model_validate(evaluation)


@router.get("/evaluations/{call_id}", response_model=QAEvaluationListResponse)
async def get_call_evaluations(
    call_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    q = select(QAEvaluation).where(
        QAEvaluation.call_id == call_id
    ).order_by(QAEvaluation.created_at.desc())
    result = await db.execute(q)
    items = result.scalars().all()
    return QAEvaluationListResponse(
        items=[QAEvaluationResponse.model_validate(e) for e in items],
        total=len(items),
    )


@router.get("/evaluations", response_model=QAEvaluationListResponse)
async def list_evaluations(
    organization_id: uuid.UUID = Depends(get_project_id),
    scorecard_id: uuid.UUID | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    filters = [QAEvaluation.scorecard_id.in_(
        select(QAScorecard.id).where(QAScorecard.organization_id == organization_id)
    )]
    if scorecard_id:
        filters.append(QAEvaluation.scorecard_id == scorecard_id)

    count_q = select(func.count()).select_from(QAEvaluation).where(*filters)
    total = (await db.execute(count_q)).scalar() or 0

    q = (
        select(QAEvaluation)
        .where(*filters)
        .order_by(QAEvaluation.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    result = await db.execute(q)
    items = result.scalars().all()

    return QAEvaluationListResponse(
        items=[QAEvaluationResponse.model_validate(e) for e in items],
        total=total,
    )
