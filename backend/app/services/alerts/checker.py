"""Alert checker service.

Loads active AlertRules, computes current KPI metrics, and creates
AlertHistory records when thresholds are breached.
"""

import logging
import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.alert import AlertHistory, AlertRule
from app.models.call import Call, CallStatus
from app.models.emotion import EmotionAnalysis, SentimentType
from app.models.script import ScriptAnalysis
from app.models.summary import CallSummary

logger = logging.getLogger(__name__)

# Metric labels for human-readable messages
METRIC_LABELS = {
    "aht": "Average Handle Time",
    "avg_script_score": "Avg Script Score",
    "resolution_rate": "Resolution Rate",
    "negative_sentiment_pct": "Negative Sentiment %",
    "total_calls": "Total Calls",
    "failed_calls": "Failed Calls",
}


async def check_alerts(
    db: AsyncSession,
    organization_id: uuid.UUID,
    lookback_hours: int = 24,
) -> list[AlertHistory]:
    """Check all active alert rules for the organization.

    Computes metrics for the last `lookback_hours` and compares against rules.
    Returns list of newly triggered AlertHistory entries.
    """
    now = datetime.now(timezone.utc)
    period_start = now - timedelta(hours=lookback_hours)

    # Load active rules
    rules_q = await db.execute(
        select(AlertRule).where(
            AlertRule.organization_id == organization_id,
            AlertRule.is_active == True,
        )
    )
    rules = rules_q.scalars().all()

    if not rules:
        return []

    # Compute current metrics
    metrics = await _compute_metrics(db, organization_id, period_start, now)

    triggered = []
    for rule in rules:
        # Check cooldown
        if rule.last_triggered_at:
            cooldown_end = rule.last_triggered_at + timedelta(minutes=rule.cooldown_minutes)
            if now < cooldown_end:
                continue

        value = metrics.get(rule.metric_name)
        if value is None:
            continue

        breached = False
        if rule.condition == "above" and value > rule.threshold:
            breached = True
        elif rule.condition == "below" and value < rule.threshold:
            breached = True

        if breached:
            label = METRIC_LABELS.get(rule.metric_name, rule.metric_name)
            message = (
                f"{label} is {value:.1f} "
                f"({'above' if rule.condition == 'above' else 'below'} "
                f"threshold {rule.threshold:.1f})"
            )

            history = AlertHistory(
                rule_id=rule.id,
                organization_id=organization_id,
                metric_name=rule.metric_name,
                metric_value=value,
                threshold=rule.threshold,
                severity=rule.severity,
                message=message,
            )
            db.add(history)

            rule.last_triggered_at = now
            triggered.append(history)

            logger.info(f"Alert triggered: {rule.name} — {message}")

    if triggered:
        await db.flush()

    return triggered


async def _compute_metrics(
    db: AsyncSession,
    organization_id: uuid.UUID,
    period_start: datetime,
    period_end: datetime,
) -> dict[str, float]:
    """Compute KPI metrics for the given period."""
    base_filter = [
        Call.organization_id == organization_id,
        Call.created_at >= period_start,
        Call.created_at <= period_end,
    ]

    metrics: dict[str, float] = {}

    # Total calls
    total_q = await db.execute(
        select(func.count()).select_from(Call).where(*base_filter)
    )
    total = total_q.scalar() or 0
    metrics["total_calls"] = float(total)

    # Failed calls
    failed_q = await db.execute(
        select(func.count()).select_from(Call).where(
            *base_filter, Call.status == CallStatus.FAILED
        )
    )
    metrics["failed_calls"] = float(failed_q.scalar() or 0)

    completed_filter = [*base_filter, Call.status == CallStatus.COMPLETED]

    # AHT
    aht_q = await db.execute(
        select(func.avg(Call.duration_seconds)).where(
            *completed_filter, Call.duration_seconds.isnot(None)
        )
    )
    aht = aht_q.scalar()
    if aht is not None:
        metrics["aht"] = round(float(aht), 1)

    # Avg Script Score
    script_q = await db.execute(
        select(func.avg(ScriptAnalysis.overall_score)).join(
            Call, ScriptAnalysis.call_id == Call.id
        ).where(*completed_filter)
    )
    avg_script = script_q.scalar()
    if avg_script is not None:
        metrics["avg_script_score"] = round(float(avg_script), 1)

    # Resolution Rate
    completed_count_q = await db.execute(
        select(func.count()).select_from(Call).where(*completed_filter)
    )
    completed_count = completed_count_q.scalar() or 0

    if completed_count > 0:
        resolved_q = await db.execute(
            select(func.count()).select_from(CallSummary).join(
                Call, CallSummary.call_id == Call.id
            ).where(*completed_filter, CallSummary.outcome == "resolved")
        )
        resolved = resolved_q.scalar() or 0
        metrics["resolution_rate"] = round(resolved / completed_count * 100, 1)

    # Negative Sentiment %
    if completed_count > 0:
        neg_q = await db.execute(
            select(func.count()).select_from(EmotionAnalysis).join(
                Call, EmotionAnalysis.call_id == Call.id
            ).where(*completed_filter, EmotionAnalysis.overall_sentiment == SentimentType.NEGATIVE)
        )
        neg_count = neg_q.scalar() or 0
        metrics["negative_sentiment_pct"] = round(neg_count / completed_count * 100, 1)

    return metrics
