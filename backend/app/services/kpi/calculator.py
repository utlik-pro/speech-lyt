"""KPI calculation service.

Computes call center KPI metrics from processed calls:
- AHT (Average Handle Time)
- Talk/Listen Ratio
- Average Script Compliance Score
- Sentiment Distribution
- Call Resolution Rate
- Average Calls Per Agent
- Heatmap (calls by day-of-week and hour)
- Word cloud (top words from transcriptions)
- Period comparison (current vs previous period)
"""

import logging
import re
from collections import Counter
from datetime import datetime, timedelta

from sqlalchemy import func, select, extract, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.agent import Agent
from app.models.call import Call, CallStatus
from app.models.emotion import EmotionAnalysis, SentimentType
from app.models.script import ScriptAnalysis
from app.models.summary import CallSummary
from app.models.transcription import Transcription

logger = logging.getLogger(__name__)

# Default thresholds for KPI alerts
DEFAULT_THRESHOLDS = {
    "aht": {"min": 60, "max": 600, "unit": "sec"},
    "avg_script_score": {"min": 70, "max": None, "unit": "%"},
    "resolution_rate": {"min": 60, "max": None, "unit": "%"},
    "negative_sentiment_pct": {"min": None, "max": 30, "unit": "%"},
}


async def calculate_dashboard_kpis(
    db: AsyncSession,
    organization_id,
    period_start: datetime,
    period_end: datetime,
    agent_id=None,
) -> dict:
    """Calculate all KPI metrics for the dashboard.

    Returns a dict with keys: total_calls, completed_calls, failed_calls,
    metrics, agents, sentiment_distribution, category_distribution.
    """
    # Base query for the period
    base_filter = [
        Call.organization_id == organization_id,
        Call.created_at >= period_start,
        Call.created_at <= period_end,
    ]
    if agent_id:
        base_filter.append(Call.agent_id == agent_id)

    # Total calls
    total_q = select(func.count()).select_from(Call).where(*base_filter)
    total_calls = (await db.execute(total_q)).scalar() or 0

    # Completed calls
    completed_q = select(func.count()).select_from(Call).where(
        *base_filter, Call.status == CallStatus.COMPLETED
    )
    completed_calls = (await db.execute(completed_q)).scalar() or 0

    # Failed calls
    failed_q = select(func.count()).select_from(Call).where(
        *base_filter, Call.status == CallStatus.FAILED
    )
    failed_calls = (await db.execute(failed_q)).scalar() or 0

    # AHT (Average Handle Time)
    aht_q = select(func.avg(Call.duration_seconds)).where(
        *base_filter, Call.status == CallStatus.COMPLETED, Call.duration_seconds.isnot(None)
    )
    aht = (await db.execute(aht_q)).scalar() or 0.0

    # Average Script Compliance Score
    script_score_q = (
        select(func.avg(ScriptAnalysis.overall_score))
        .join(Call, ScriptAnalysis.call_id == Call.id)
        .where(*base_filter)
    )
    avg_script_score = (await db.execute(script_score_q)).scalar()

    # Sentiment distribution
    sentiment_q = (
        select(EmotionAnalysis.overall_sentiment, func.count())
        .join(Call, EmotionAnalysis.call_id == Call.id)
        .where(*base_filter)
        .group_by(EmotionAnalysis.overall_sentiment)
    )
    sentiment_rows = (await db.execute(sentiment_q)).all()
    sentiment_distribution = {str(row[0].value): row[1] for row in sentiment_rows}

    # Category distribution from summaries
    category_q = (
        select(CallSummary.category, func.count())
        .join(Call, CallSummary.call_id == Call.id)
        .where(*base_filter, CallSummary.category.isnot(None))
        .group_by(CallSummary.category)
    )
    category_rows = (await db.execute(category_q)).all()
    category_distribution = {row[0]: row[1] for row in category_rows}

    # Resolution rate from summaries
    resolved_q = (
        select(func.count())
        .select_from(CallSummary)
        .join(Call, CallSummary.call_id == Call.id)
        .where(*base_filter, CallSummary.outcome == "resolved")
    )
    resolved_count = (await db.execute(resolved_q)).scalar() or 0

    total_with_summary_q = (
        select(func.count())
        .select_from(CallSummary)
        .join(Call, CallSummary.call_id == Call.id)
        .where(*base_filter)
    )
    total_with_summary = (await db.execute(total_with_summary_q)).scalar() or 0
    resolution_rate = (resolved_count / total_with_summary * 100) if total_with_summary > 0 else 0.0

    # Negative sentiment percentage
    negative_count = sentiment_distribution.get("negative", 0)
    total_sentiments = sum(sentiment_distribution.values()) if sentiment_distribution else 0
    negative_pct = (negative_count / total_sentiments * 100) if total_sentiments > 0 else 0.0

    # Build metrics list
    metrics = [
        _build_metric("aht", "Average Handle Time", round(aht, 1), "sec"),
        _build_metric(
            "avg_script_score",
            "Avg Script Compliance",
            round(avg_script_score, 1) if avg_script_score is not None else None,
            "%",
        ),
        _build_metric("resolution_rate", "Resolution Rate", round(resolution_rate, 1), "%"),
        _build_metric("negative_sentiment_pct", "Negative Sentiment", round(negative_pct, 1), "%"),
        _build_metric(
            "completion_rate",
            "Completion Rate",
            round(completed_calls / total_calls * 100, 1) if total_calls > 0 else 0.0,
            "%",
        ),
    ]

    # Per-agent breakdown
    agents = []
    if not agent_id:
        agent_q = (
            select(
                Call.agent_id,
                Agent.name.label("agent_name"),
                func.count().label("cnt"),
                func.avg(Call.duration_seconds).label("avg_dur"),
            )
            .outerjoin(Agent, Call.agent_id == Agent.id)
            .where(*base_filter, Call.agent_id.isnot(None), Call.status == CallStatus.COMPLETED)
            .group_by(Call.agent_id, Agent.name)
        )
        agent_rows = (await db.execute(agent_q)).all()
        for row in agent_rows:
            agent_metrics = [
                _build_metric("calls", "Total Calls", row.cnt, ""),
                _build_metric("aht", "Avg Handle Time", round(row.avg_dur or 0, 1), "sec"),
            ]
            agents.append({
                "agent_id": row.agent_id,
                "agent_label": row.agent_name or f"Agent {str(row.agent_id)[:8]}",
                "total_calls": row.cnt,
                "metrics": agent_metrics,
            })

    return {
        "total_calls": total_calls,
        "completed_calls": completed_calls,
        "failed_calls": failed_calls,
        "metrics": metrics,
        "agents": agents,
        "sentiment_distribution": sentiment_distribution,
        "category_distribution": category_distribution,
    }


async def calculate_kpi_trend(
    db: AsyncSession,
    organization_id,
    metric_name: str,
    period_start: datetime,
    period_end: datetime,
    granularity: str = "day",
) -> list[dict]:
    """Calculate KPI trend data points grouped by day/week/month."""
    if granularity == "week":
        trunc_func = func.date_trunc("week", Call.created_at)
    elif granularity == "month":
        trunc_func = func.date_trunc("month", Call.created_at)
    else:
        trunc_func = func.date_trunc("day", Call.created_at)

    base_filter = [
        Call.organization_id == organization_id,
        Call.created_at >= period_start,
        Call.created_at <= period_end,
        Call.status == CallStatus.COMPLETED,
    ]

    if metric_name == "aht":
        q = (
            select(trunc_func.label("period"), func.avg(Call.duration_seconds).label("val"))
            .where(*base_filter, Call.duration_seconds.isnot(None))
            .group_by("period")
            .order_by("period")
        )
    elif metric_name == "call_volume":
        q = (
            select(trunc_func.label("period"), func.count().label("val"))
            .where(*base_filter)
            .group_by("period")
            .order_by("period")
        )
    elif metric_name == "avg_script_score":
        q = (
            select(trunc_func.label("period"), func.avg(ScriptAnalysis.overall_score).label("val"))
            .select_from(ScriptAnalysis)
            .join(Call, ScriptAnalysis.call_id == Call.id)
            .where(*base_filter)
            .group_by("period")
            .order_by("period")
        )
    else:
        return []

    rows = (await db.execute(q)).all()
    return [{"date": row.period.strftime("%Y-%m-%d"), "value": round(float(row.val or 0), 1)} for row in rows]


async def check_kpi_alerts(
    db: AsyncSession,
    organization_id,
    period_start: datetime,
    period_end: datetime,
    thresholds: dict | None = None,
) -> list[dict]:
    """Check KPI values against thresholds and return triggered alerts."""
    t = thresholds or DEFAULT_THRESHOLDS
    kpis = await calculate_dashboard_kpis(db, organization_id, period_start, period_end)
    alerts = []

    for metric in kpis["metrics"]:
        name = metric["name"]
        if name not in t:
            continue

        value = metric["value"]
        if value is None:
            continue

        rules = t[name]
        if rules.get("min") is not None and value < rules["min"]:
            alerts.append({
                "metric_name": name,
                "label": metric["label"],
                "current_value": value,
                "threshold": rules["min"],
                "direction": "below",
                "severity": "warning" if value >= rules["min"] * 0.8 else "critical",
                "message": f"{metric['label']} ({value}{metric['unit']}) is below minimum threshold ({rules['min']}{metric['unit']})",
            })

        if rules.get("max") is not None and value > rules["max"]:
            alerts.append({
                "metric_name": name,
                "label": metric["label"],
                "current_value": value,
                "threshold": rules["max"],
                "direction": "above",
                "severity": "warning" if value <= rules["max"] * 1.2 else "critical",
                "message": f"{metric['label']} ({value}{metric['unit']}) exceeds maximum threshold ({rules['max']}{metric['unit']})",
            })

    return alerts


def _build_metric(name: str, label: str, value, unit: str) -> dict:
    """Build a KPI metric dict with threshold status."""
    thresholds = DEFAULT_THRESHOLDS.get(name, {})
    status = "normal"

    if value is not None:
        t_min = thresholds.get("min")
        t_max = thresholds.get("max")
        if t_min is not None and value < t_min:
            status = "critical" if value < t_min * 0.8 else "warning"
        elif t_max is not None and value > t_max:
            status = "critical" if value > t_max * 1.2 else "warning"

    return {
        "name": name,
        "label": label,
        "value": value if value is not None else 0.0,
        "unit": unit,
        "threshold_min": thresholds.get("min"),
        "threshold_max": thresholds.get("max"),
        "status": status,
    }


# ── Heatmap ─────────────────────────────────────────────────────────────────

async def calculate_heatmap(
    db: AsyncSession,
    organization_id,
    period_start: datetime,
    period_end: datetime,
) -> list[dict]:
    """Calculate call volume heatmap: day-of-week (0=Mon) x hour (0-23)."""
    # PostgreSQL DOW: 0=Sunday, we shift to 0=Monday
    q = (
        select(
            extract("dow", Call.created_at).label("dow"),
            extract("hour", Call.created_at).label("hour"),
            func.count().label("cnt"),
        )
        .where(
            Call.organization_id == organization_id,
            Call.created_at >= period_start,
            Call.created_at <= period_end,
        )
        .group_by("dow", "hour")
    )
    rows = (await db.execute(q)).all()

    cells = []
    for row in rows:
        # Shift: PostgreSQL DOW 0=Sunday → our 6=Sunday, 1=Monday→0, etc.
        pg_dow = int(row.dow)
        day = (pg_dow - 1) % 7  # 1→0(Mon), 2→1(Tue), ..., 0→6(Sun)
        cells.append({"day": day, "hour": int(row.hour), "count": row.cnt})

    return cells


# ── Word Cloud ──────────────────────────────────────────────────────────────

RUSSIAN_STOPWORDS = {
    "и", "в", "во", "не", "что", "он", "на", "я", "с", "со", "как", "а", "то",
    "все", "она", "так", "его", "но", "да", "ты", "к", "у", "же", "вы", "за",
    "бы", "по", "только", "её", "мне", "было", "вот", "от", "меня", "ещё",
    "нет", "о", "из", "ему", "теперь", "когда", "даже", "ну", "вдруг", "ли",
    "если", "уже", "или", "ни", "быть", "был", "него", "до", "вас", "нибудь",
    "опять", "уж", "вам", "ведь", "там", "потом", "себя", "ничего", "ей",
    "может", "они", "тут", "где", "есть", "надо", "ней", "для", "мы", "тебя",
    "их", "чем", "была", "сам", "чтоб", "без", "будто", "чего", "раз",
    "тоже", "себе", "под", "будет", "ж", "тогда", "кто", "этот", "того",
    "потому", "этого", "какой", "совсем", "ним", "здесь", "этом", "один",
    "почти", "мой", "тем", "чтобы", "нее", "сейчас", "были", "куда", "зачем",
    "всех", "никогда", "можно", "при", "наконец", "два", "об", "другой", "хоть",
    "после", "над", "больше", "тот", "через", "эти", "нас", "про", "всего",
    "них", "какая", "много", "разве", "три", "эту", "моя", "впрочем", "хорошо",
    "свою", "этой", "перед", "иногда", "лучше", "чуть", "том", "нельзя",
    "такой", "им", "более", "всегда", "конечно", "всю", "между", "это", "мне",
    "вы", "нам",
}


async def calculate_word_cloud(
    db: AsyncSession,
    organization_id,
    period_start: datetime,
    period_end: datetime,
    limit: int = 50,
) -> list[dict]:
    """Calculate word frequencies from transcriptions for word cloud."""
    q = (
        select(Transcription.full_text)
        .join(Call, Transcription.call_id == Call.id)
        .where(
            Call.organization_id == organization_id,
            Call.created_at >= period_start,
            Call.created_at <= period_end,
        )
    )
    rows = (await db.execute(q)).all()

    counter = Counter()
    word_re = re.compile(r"[а-яёА-ЯЁa-zA-Z]{3,}")
    for row in rows:
        if row.full_text:
            words = word_re.findall(row.full_text.lower())
            counter.update(w for w in words if w not in RUSSIAN_STOPWORDS)

    return [{"word": word, "count": count} for word, count in counter.most_common(limit)]


# ── Period Comparison ───────────────────────────────────────────────────────

async def calculate_period_comparison(
    db: AsyncSession,
    organization_id,
    period_start: datetime,
    period_end: datetime,
) -> dict:
    """Compare KPIs between current period and previous period of same length."""
    duration = period_end - period_start
    prev_end = period_start
    prev_start = prev_end - duration

    current = await calculate_dashboard_kpis(db, organization_id, period_start, period_end)
    previous = await calculate_dashboard_kpis(db, organization_id, prev_start, prev_end)

    comparisons = []
    current_metrics = {m["name"]: m for m in current["metrics"]}
    previous_metrics = {m["name"]: m for m in previous["metrics"]}

    # Compare core metrics
    for name in ["aht", "avg_script_score", "resolution_rate", "negative_sentiment_pct", "completion_rate"]:
        cm = current_metrics.get(name)
        pm = previous_metrics.get(name)
        if not cm or not pm:
            continue
        cv = cm["value"]
        pv = pm["value"]
        delta = cv - pv
        pct = (delta / pv * 100) if pv != 0 else None
        comparisons.append({
            "name": name,
            "label": cm["label"],
            "current": cv,
            "previous": pv,
            "delta": round(delta, 1),
            "pct_change": round(pct, 1) if pct is not None else None,
        })

    # Also compare total calls
    tc_delta = current["total_calls"] - previous["total_calls"]
    tc_pct = (tc_delta / previous["total_calls"] * 100) if previous["total_calls"] > 0 else None
    comparisons.insert(0, {
        "name": "total_calls",
        "label": "Total Calls",
        "current": current["total_calls"],
        "previous": previous["total_calls"],
        "delta": tc_delta,
        "pct_change": round(tc_pct, 1) if tc_pct is not None else None,
    })

    return {
        "current_start": period_start,
        "current_end": period_end,
        "previous_start": prev_start,
        "previous_end": prev_end,
        "metrics": comparisons,
    }
