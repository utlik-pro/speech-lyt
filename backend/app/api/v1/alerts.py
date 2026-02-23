import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.deps import get_optional_user, get_project_id
from app.core.database import get_db
from app.models.alert import AlertHistory, AlertRule
from app.schemas.alert import (
    AlertHistoryListResponse,
    AlertHistoryResponse,
    AlertRuleCreate,
    AlertRuleListResponse,
    AlertRuleResponse,
    AlertRuleUpdate,
)
from app.services.alerts.checker import check_alerts

router = APIRouter(prefix="/alerts", tags=["alerts"])


# --- Rules ---


@router.get("/rules", response_model=AlertRuleListResponse)
async def list_rules(
    organization_id: uuid.UUID = Depends(get_project_id),
    db: AsyncSession = Depends(get_db),
):
    q = select(AlertRule).where(
        AlertRule.organization_id == organization_id
    ).order_by(AlertRule.created_at.desc())
    result = await db.execute(q)
    items = result.scalars().all()

    count_q = select(func.count()).select_from(AlertRule).where(
        AlertRule.organization_id == organization_id
    )
    total = (await db.execute(count_q)).scalar() or 0

    return AlertRuleListResponse(
        items=[AlertRuleResponse.model_validate(r) for r in items],
        total=total,
    )


@router.post("/rules", response_model=AlertRuleResponse, status_code=201)
async def create_rule(
    payload: AlertRuleCreate,
    organization_id: uuid.UUID = Depends(get_project_id),
    user=Depends(get_optional_user),
    db: AsyncSession = Depends(get_db),
):
    rule = AlertRule(
        organization_id=organization_id,
        created_by=user.id if user else None,
        name=payload.name,
        metric_name=payload.metric_name,
        condition=payload.condition,
        threshold=payload.threshold,
        severity=payload.severity,
        notify_email=payload.notify_email,
        notify_webhook=payload.notify_webhook,
        cooldown_minutes=payload.cooldown_minutes,
    )
    db.add(rule)
    await db.commit()
    await db.refresh(rule)
    return AlertRuleResponse.model_validate(rule)


@router.put("/rules/{rule_id}", response_model=AlertRuleResponse)
async def update_rule(
    rule_id: uuid.UUID,
    payload: AlertRuleUpdate,
    db: AsyncSession = Depends(get_db),
):
    rule = await db.get(AlertRule, rule_id)
    if not rule:
        raise HTTPException(status_code=404, detail="Alert rule not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(rule, field, value)

    await db.commit()
    await db.refresh(rule)
    return AlertRuleResponse.model_validate(rule)


@router.delete("/rules/{rule_id}", status_code=204)
async def delete_rule(
    rule_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    rule = await db.get(AlertRule, rule_id)
    if not rule:
        raise HTTPException(status_code=404, detail="Alert rule not found")
    await db.delete(rule)
    await db.commit()


# --- History ---


@router.get("/history", response_model=AlertHistoryListResponse)
async def list_history(
    organization_id: uuid.UUID = Depends(get_project_id),
    severity: str | None = Query(default=None),
    acknowledged: bool | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    filters = [AlertHistory.organization_id == organization_id]
    if severity:
        filters.append(AlertHistory.severity == severity)
    if acknowledged is not None:
        filters.append(AlertHistory.acknowledged == acknowledged)

    count_q = select(func.count()).select_from(AlertHistory).where(*filters)
    total = (await db.execute(count_q)).scalar() or 0

    q = (
        select(AlertHistory)
        .where(*filters)
        .order_by(AlertHistory.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    result = await db.execute(q)
    items = result.scalars().all()

    return AlertHistoryListResponse(
        items=[AlertHistoryResponse.model_validate(h) for h in items],
        total=total,
    )


@router.put("/history/{history_id}/acknowledge", response_model=AlertHistoryResponse)
async def acknowledge_alert(
    history_id: uuid.UUID,
    user=Depends(get_optional_user),
    db: AsyncSession = Depends(get_db),
):
    history = await db.get(AlertHistory, history_id)
    if not history:
        raise HTTPException(status_code=404, detail="Alert not found")

    history.acknowledged = True
    history.acknowledged_by = user.id if user else None
    history.acknowledged_at = datetime.now(timezone.utc)

    await db.commit()
    await db.refresh(history)
    return AlertHistoryResponse.model_validate(history)


@router.post("/check")
async def trigger_check(
    organization_id: uuid.UUID = Depends(get_project_id),
    db: AsyncSession = Depends(get_db),
):
    triggered = await check_alerts(db, organization_id)
    await db.commit()
    return {
        "triggered": len(triggered),
        "alerts": [AlertHistoryResponse.model_validate(h) for h in triggered],
    }
