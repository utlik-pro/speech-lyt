"""Coaching analysis pipeline step — generates coaching insights for a manager."""

import json
import logging
import time
import uuid

from openai import AsyncOpenAI
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.call import Call, CallStatus
from app.models.emotion import EmotionAnalysis
from app.models.script import ScriptAnalysis
from app.models.summary import CallSummary
from app.services.ai_agents.steps.base import StepResult

logger = logging.getLogger(__name__)


class CoachingStep:
    step_type = "coaching"

    async def execute(
        self,
        call_id: uuid.UUID,
        transcription_text: str,
        segments: list[dict],
        config: dict,
        system_prompt: str,
        user_prompt_template: str,
        db: AsyncSession,
    ) -> StepResult:
        """Generate coaching insights based on aggregated manager data.

        Unlike other steps, coaching looks at the manager's overall performance,
        not just a single call. The call_id is used to identify the manager.
        """
        start = time.monotonic()
        try:
            # Get the manager for this call
            call = await db.get(Call, call_id)
            if not call or not call.agent_id:
                return StepResult(
                    step_type=self.step_type,
                    status="skipped",
                    result={"reason": "No manager assigned to call"},
                    duration_ms=int((time.monotonic() - start) * 1000),
                )

            manager_id = call.agent_id
            period_days = config.get("period_days", 30)

            # Gather aggregated metrics
            from datetime import datetime, timedelta
            period_end = datetime.utcnow()
            period_start = period_end - timedelta(days=period_days)

            base_filter = [
                Call.agent_id == manager_id,
                Call.status == CallStatus.COMPLETED,
                Call.created_at >= period_start,
                Call.created_at <= period_end,
            ]

            # Total calls
            total = (await db.execute(
                select(func.count()).select_from(Call).where(*base_filter)
            )).scalar() or 0

            # AHT
            aht = (await db.execute(
                select(func.avg(Call.duration_seconds)).where(*base_filter)
            )).scalar() or 0

            # Script score
            script_score = (await db.execute(
                select(func.avg(ScriptAnalysis.overall_score))
                .join(Call, ScriptAnalysis.call_id == Call.id)
                .where(*base_filter)
            )).scalar()

            # Sentiment distribution
            sentiment_rows = (await db.execute(
                select(EmotionAnalysis.overall_sentiment, func.count())
                .join(Call, EmotionAnalysis.call_id == Call.id)
                .where(*base_filter)
                .group_by(EmotionAnalysis.overall_sentiment)
            )).all()
            sentiment_dist = {str(r[0].value): r[1] for r in sentiment_rows}

            # Resolution rate
            resolved = (await db.execute(
                select(func.count()).select_from(CallSummary)
                .join(Call, CallSummary.call_id == Call.id)
                .where(*base_filter, CallSummary.outcome == "resolved")
            )).scalar() or 0
            total_summaries = (await db.execute(
                select(func.count()).select_from(CallSummary)
                .join(Call, CallSummary.call_id == Call.id)
                .where(*base_filter)
            )).scalar() or 0
            resolution_rate = (resolved / total_summaries * 100) if total_summaries > 0 else 0

            # Get manager name
            from app.models.manager import Manager
            manager = await db.get(Manager, manager_id)
            manager_name = manager.name if manager else "Unknown"

            performance_summary = {
                "total_calls": total,
                "avg_handle_time_sec": round(float(aht), 1),
                "avg_script_score": round(float(script_score), 1) if script_score else None,
                "resolution_rate_pct": round(resolution_rate, 1),
                "sentiment_distribution": sentiment_dist,
            }

            # Call LLM for coaching
            client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
            user_msg = user_prompt_template.format(
                manager_name=manager_name,
                period_start=period_start.strftime("%Y-%m-%d"),
                period_end=period_end.strftime("%Y-%m-%d"),
                performance_summary_json=json.dumps(performance_summary, ensure_ascii=False, indent=2),
            )
            response = await client.chat.completions.create(
                model=config.get("model", "gpt-4o-mini"),
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_msg},
                ],
                temperature=config.get("temperature", 0.4),
                max_tokens=config.get("max_tokens", 3000),
                response_format={"type": "json_object"},
            )
            result_text = response.choices[0].message.content or "[]"
            # Handle both array and object responses
            parsed = json.loads(result_text)
            if isinstance(parsed, dict):
                insights = parsed.get("insights", parsed.get("recommendations", [parsed]))
            else:
                insights = parsed

            duration_ms = int((time.monotonic() - start) * 1000)
            return StepResult(
                step_type=self.step_type,
                status="completed",
                result={
                    "manager_id": str(manager_id),
                    "manager_name": manager_name,
                    "performance_summary": performance_summary,
                    "insights": insights,
                },
                duration_ms=duration_ms,
                input_tokens=response.usage.prompt_tokens if response.usage else 0,
                output_tokens=response.usage.completion_tokens if response.usage else 0,
            )
        except Exception as e:
            logger.error("Coaching step failed: %s", e)
            return StepResult(
                step_type=self.step_type,
                status="failed",
                duration_ms=int((time.monotonic() - start) * 1000),
                error=str(e),
            )
