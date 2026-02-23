"""Report generation service — builds report data from calls and analytics."""

import logging
import uuid
from datetime import datetime

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.manager import Manager
from app.models.call import Call, CallStatus
from app.models.call_kpi import CallKPI
from app.models.emotion import EmotionAnalysis, SentimentType
from app.models.summary import CallSummary

logger = logging.getLogger(__name__)


class ReportGenerator:
    """Generate structured report data from DB."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def generate_calls_report(
        self,
        organization_id: uuid.UUID,
        date_from: datetime,
        date_to: datetime,
        agent_id: uuid.UUID | None = None,
    ) -> dict:
        """Generate a report about calls in a date range."""
        query = select(Call).where(
            Call.organization_id == organization_id,
            Call.created_at >= date_from,
            Call.created_at <= date_to,
            Call.status == CallStatus.COMPLETED,
        )
        if agent_id:
            query = query.where(Call.agent_id == agent_id)

        result = await self.db.execute(query.order_by(Call.created_at))
        calls = result.scalars().all()

        rows = []
        for call in calls:
            row = {
                "call_id": str(call.id),
                "date": call.created_at.strftime("%Y-%m-%d %H:%M"),
                "phone_number": call.phone_number or "",
                "direction": call.direction.value if call.direction else "",
                "duration_seconds": call.duration_seconds or 0,
                "status": call.status.value if call.status else "",
            }

            # Fetch manager name
            if call.agent_id:
                manager = await self.db.get(Manager, call.agent_id)
                row["agent_name"] = manager.name if manager else ""
            else:
                row["agent_name"] = ""

            # Fetch sentiment
            emo_result = await self.db.execute(
                select(EmotionAnalysis).where(EmotionAnalysis.call_id == call.id)
            )
            emotion = emo_result.scalar_one_or_none()
            row["sentiment"] = emotion.overall_sentiment.value if emotion and emotion.overall_sentiment else ""

            # Fetch summary
            sum_result = await self.db.execute(
                select(CallSummary).where(CallSummary.call_id == call.id)
            )
            summary = sum_result.scalar_one_or_none()
            row["summary"] = summary.short_summary if summary else ""
            row["category"] = summary.category if summary else ""

            # Fetch KPI
            kpi_result = await self.db.execute(
                select(CallKPI).where(CallKPI.call_id == call.id)
            )
            kpi = kpi_result.scalar_one_or_none()
            row["script_score"] = kpi.script_score if kpi else None
            row["talk_listen_ratio"] = kpi.talk_listen_ratio if kpi else None

            rows.append(row)

        # Aggregate stats
        total_calls = len(rows)
        total_duration = sum(r["duration_seconds"] for r in rows)
        avg_duration = total_duration / total_calls if total_calls else 0
        sentiment_counts = {}
        for r in rows:
            s = r.get("sentiment", "unknown") or "unknown"
            sentiment_counts[s] = sentiment_counts.get(s, 0) + 1

        return {
            "title": "Calls Report",
            "period": f"{date_from.strftime('%Y-%m-%d')} — {date_to.strftime('%Y-%m-%d')}",
            "generated_at": datetime.utcnow().isoformat(),
            "summary": {
                "total_calls": total_calls,
                "total_duration_seconds": total_duration,
                "avg_duration_seconds": round(avg_duration, 1),
                "sentiment_distribution": sentiment_counts,
            },
            "columns": [
                "date", "agent_name", "phone_number", "direction",
                "duration_seconds", "sentiment", "category", "summary",
                "script_score", "talk_listen_ratio",
            ],
            "rows": rows,
        }

    async def generate_managers_report(
        self,
        organization_id: uuid.UUID,
        date_from: datetime,
        date_to: datetime,
    ) -> dict:
        """Generate a report of manager performance in a date range."""
        managers_result = await self.db.execute(
            select(Manager).where(Manager.organization_id == organization_id, Manager.is_active.is_(True))
        )
        managers = managers_result.scalars().all()

        rows = []
        for manager in managers:
            calls_result = await self.db.execute(
                select(func.count()).select_from(Call).where(
                    Call.agent_id == manager.id,
                    Call.status == CallStatus.COMPLETED,
                    Call.created_at >= date_from,
                    Call.created_at <= date_to,
                )
            )
            total_calls = calls_result.scalar() or 0

            avg_dur_result = await self.db.execute(
                select(func.avg(Call.duration_seconds)).where(
                    Call.agent_id == manager.id,
                    Call.status == CallStatus.COMPLETED,
                    Call.created_at >= date_from,
                    Call.created_at <= date_to,
                )
            )
            avg_duration = avg_dur_result.scalar() or 0

            # Sentiment distribution
            sent_result = await self.db.execute(
                select(EmotionAnalysis.overall_sentiment, func.count()).join(
                    Call, Call.id == EmotionAnalysis.call_id
                ).where(
                    Call.agent_id == manager.id,
                    Call.created_at >= date_from,
                    Call.created_at <= date_to,
                ).group_by(EmotionAnalysis.overall_sentiment)
            )
            sentiments = {row[0].value: row[1] for row in sent_result.all() if row[0]}
            positive = sentiments.get("positive", 0)
            total_with_sentiment = sum(sentiments.values())
            positive_pct = round(positive / total_with_sentiment * 100, 1) if total_with_sentiment else 0

            rows.append({
                "agent_id": str(manager.id),
                "agent_name": manager.name,
                "team": manager.team or "",
                "total_calls": total_calls,
                "avg_duration_seconds": round(avg_duration, 1),
                "positive_sentiment_pct": positive_pct,
                "sentiment_distribution": sentiments,
            })

        return {
            "title": "Manager Performance Report",
            "period": f"{date_from.strftime('%Y-%m-%d')} — {date_to.strftime('%Y-%m-%d')}",
            "generated_at": datetime.utcnow().isoformat(),
            "summary": {
                "total_managers": len(rows),
                "total_calls": sum(r["total_calls"] for r in rows),
            },
            "columns": [
                "agent_name", "team", "total_calls", "avg_duration_seconds",
                "positive_sentiment_pct",
            ],
            "rows": rows,
        }
