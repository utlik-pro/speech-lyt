"""Manager statistics and leaderboard service."""

import logging
from datetime import datetime

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.manager import Manager
from app.models.call import Call, CallStatus
from app.models.emotion import EmotionAnalysis, SentimentType
from app.models.script import ScriptAnalysis
from app.models.summary import CallSummary

logger = logging.getLogger(__name__)


async def get_manager_leaderboard(
    db: AsyncSession,
    organization_id,
    period_start: datetime,
    period_end: datetime,
) -> list[dict]:
    """Build manager leaderboard ranked by composite score.

    Composite score = 0.3*resolution_rate + 0.25*script_score + 0.25*(1-negative%) + 0.2*(1/AHT_norm)
    """
    base_filter = [
        Call.organization_id == organization_id,
        Call.created_at >= period_start,
        Call.created_at <= period_end,
        Call.status == CallStatus.COMPLETED,
        Call.agent_id.isnot(None),
    ]

    # Per-manager call stats
    manager_calls_q = (
        select(
            Call.agent_id,
            func.count().label("total_calls"),
            func.avg(Call.duration_seconds).label("avg_handle_time"),
        )
        .where(*base_filter)
        .group_by(Call.agent_id)
    )
    manager_rows = (await db.execute(manager_calls_q)).all()

    if not manager_rows:
        return []

    manager_ids = [row.agent_id for row in manager_rows]
    manager_map = {row.agent_id: {"total_calls": row.total_calls, "avg_handle_time": float(row.avg_handle_time or 0)} for row in manager_rows}

    # Manager names
    managers_q = select(Manager).where(Manager.id.in_(manager_ids))
    managers = {a.id: a for a in (await db.execute(managers_q)).scalars().all()}

    # Per-manager script scores
    script_q = (
        select(Call.agent_id, func.avg(ScriptAnalysis.overall_score).label("avg_score"))
        .select_from(ScriptAnalysis)
        .join(Call, ScriptAnalysis.call_id == Call.id)
        .where(*base_filter, Call.agent_id.in_(manager_ids))
        .group_by(Call.agent_id)
    )
    for row in (await db.execute(script_q)).all():
        manager_map[row.agent_id]["avg_script_score"] = float(row.avg_score) if row.avg_score else None

    # Per-manager resolution rate
    resolved_q = (
        select(Call.agent_id, func.count().label("resolved"))
        .select_from(CallSummary)
        .join(Call, CallSummary.call_id == Call.id)
        .where(*base_filter, Call.agent_id.in_(manager_ids), CallSummary.outcome == "resolved")
        .group_by(Call.agent_id)
    )
    resolved_map = {row.agent_id: row.resolved for row in (await db.execute(resolved_q)).all()}

    total_summary_q = (
        select(Call.agent_id, func.count().label("total"))
        .select_from(CallSummary)
        .join(Call, CallSummary.call_id == Call.id)
        .where(*base_filter, Call.agent_id.in_(manager_ids))
        .group_by(Call.agent_id)
    )
    total_summary_map = {row.agent_id: row.total for row in (await db.execute(total_summary_q)).all()}

    # Per-manager positive sentiment %
    positive_q = (
        select(Call.agent_id, func.count().label("pos"))
        .select_from(EmotionAnalysis)
        .join(Call, EmotionAnalysis.call_id == Call.id)
        .where(*base_filter, Call.agent_id.in_(manager_ids), EmotionAnalysis.overall_sentiment == SentimentType.POSITIVE)
        .group_by(Call.agent_id)
    )
    positive_map = {row.agent_id: row.pos for row in (await db.execute(positive_q)).all()}

    total_emotion_q = (
        select(Call.agent_id, func.count().label("total"))
        .select_from(EmotionAnalysis)
        .join(Call, EmotionAnalysis.call_id == Call.id)
        .where(*base_filter, Call.agent_id.in_(manager_ids))
        .group_by(Call.agent_id)
    )
    total_emotion_map = {row.agent_id: row.total for row in (await db.execute(total_emotion_q)).all()}

    # Build entries
    entries = []
    for mid in manager_ids:
        data = manager_map[mid]
        manager = managers.get(mid)
        total_summaries = total_summary_map.get(mid, 0)
        resolved = resolved_map.get(mid, 0)
        resolution_rate = (resolved / total_summaries * 100) if total_summaries > 0 else 0.0

        total_emotions = total_emotion_map.get(mid, 0)
        positive = positive_map.get(mid, 0)
        positive_pct = (positive / total_emotions * 100) if total_emotions > 0 else 0.0

        entries.append({
            "manager_id": mid,
            "name": manager.name if manager else f"Manager {str(mid)[:8]}",
            "team": manager.team if manager else None,
            "total_calls": data["total_calls"],
            "avg_handle_time": round(data["avg_handle_time"], 1),
            "avg_script_score": round(data.get("avg_script_score", 0) or 0, 1) if data.get("avg_script_score") is not None else None,
            "resolution_rate": round(resolution_rate, 1),
            "positive_sentiment_pct": round(positive_pct, 1),
        })

    # Rank by composite score
    def composite(e):
        res = e["resolution_rate"] / 100
        script = (e["avg_script_score"] or 50) / 100
        pos = e["positive_sentiment_pct"] / 100
        aht = e["avg_handle_time"]
        aht_norm = 1 - min(aht / 900, 1)  # normalize: lower AHT is better
        return 0.3 * res + 0.25 * script + 0.25 * pos + 0.2 * aht_norm

    entries.sort(key=composite, reverse=True)
    for i, e in enumerate(entries):
        e["rank"] = i + 1

    return entries


async def get_manager_stats(
    db: AsyncSession,
    manager_id,
    organization_id,
    period_start: datetime,
    period_end: datetime,
) -> dict | None:
    """Get detailed statistics for a single manager."""
    # Get manager record
    manager = await db.get(Manager, manager_id)
    if not manager or manager.organization_id != organization_id:
        return None

    base_filter = [
        Call.organization_id == organization_id,
        Call.agent_id == manager_id,
        Call.created_at >= period_start,
        Call.created_at <= period_end,
    ]

    # Total calls
    total_q = select(func.count()).select_from(Call).where(*base_filter)
    total_calls = (await db.execute(total_q)).scalar() or 0

    # Completed calls
    completed_q = select(func.count()).select_from(Call).where(
        *base_filter, Call.status == CallStatus.COMPLETED
    )
    completed_calls = (await db.execute(completed_q)).scalar() or 0

    # AHT
    aht_q = select(func.avg(Call.duration_seconds)).where(
        *base_filter, Call.status == CallStatus.COMPLETED, Call.duration_seconds.isnot(None)
    )
    aht = (await db.execute(aht_q)).scalar() or 0.0

    # Script score
    script_q = (
        select(func.avg(ScriptAnalysis.overall_score))
        .join(Call, ScriptAnalysis.call_id == Call.id)
        .where(*base_filter, Call.status == CallStatus.COMPLETED)
    )
    avg_script_score = (await db.execute(script_q)).scalar()

    # Resolution rate
    resolved_q = (
        select(func.count())
        .select_from(CallSummary)
        .join(Call, CallSummary.call_id == Call.id)
        .where(*base_filter, CallSummary.outcome == "resolved")
    )
    resolved = (await db.execute(resolved_q)).scalar() or 0

    total_summary_q = (
        select(func.count())
        .select_from(CallSummary)
        .join(Call, CallSummary.call_id == Call.id)
        .where(*base_filter)
    )
    total_summaries = (await db.execute(total_summary_q)).scalar() or 0
    resolution_rate = (resolved / total_summaries * 100) if total_summaries > 0 else 0.0

    # Sentiment distribution
    sentiment_q = (
        select(EmotionAnalysis.overall_sentiment, func.count())
        .join(Call, EmotionAnalysis.call_id == Call.id)
        .where(*base_filter)
        .group_by(EmotionAnalysis.overall_sentiment)
    )
    sentiment_rows = (await db.execute(sentiment_q)).all()
    sentiment_distribution = {str(row[0].value): row[1] for row in sentiment_rows}

    # Category distribution
    category_q = (
        select(CallSummary.category, func.count())
        .join(Call, CallSummary.call_id == Call.id)
        .where(*base_filter, CallSummary.category.isnot(None))
        .group_by(CallSummary.category)
    )
    category_rows = (await db.execute(category_q)).all()
    category_distribution = {row[0]: row[1] for row in category_rows}

    return {
        "manager": manager,
        "total_calls": total_calls,
        "completed_calls": completed_calls,
        "avg_handle_time": round(float(aht), 1),
        "avg_script_score": round(float(avg_script_score), 1) if avg_script_score is not None else None,
        "resolution_rate": round(resolution_rate, 1),
        "sentiment_distribution": sentiment_distribution,
        "category_distribution": category_distribution,
    }
