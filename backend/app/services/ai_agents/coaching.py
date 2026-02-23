"""Coaching engine — generates insights by running coaching step on aggregated manager data."""

import json
import logging
import uuid

from openai import AsyncOpenAI
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.ai_agent import AIAgent, AIAgentPrompt
from app.models.call import Call, CallStatus
from app.models.coaching import CoachingInsight
from app.models.emotion import EmotionAnalysis
from app.models.script import ScriptAnalysis
from app.models.summary import CallSummary
from app.services.ai_agents.defaults import DEFAULT_PROMPTS

logger = logging.getLogger(__name__)


class CoachingEngine:
    """Generates coaching insights for a manager using an AI agent."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def generate_insights(
        self,
        ai_agent: AIAgent,
        manager_id: uuid.UUID,
        period_days: int = 30,
    ) -> list[CoachingInsight]:
        """Analyze a manager's performance and generate coaching insights."""
        from datetime import datetime, timedelta

        period_end = datetime.utcnow()
        period_start = period_end - timedelta(days=period_days)

        base_filter = [
            Call.agent_id == manager_id,
            Call.organization_id == ai_agent.organization_id,
            Call.status == CallStatus.COMPLETED,
            Call.created_at >= period_start,
            Call.created_at <= period_end,
        ]

        # Gather metrics
        total = (await self.db.execute(
            select(func.count()).select_from(Call).where(*base_filter)
        )).scalar() or 0

        if total == 0:
            return []

        aht = (await self.db.execute(
            select(func.avg(Call.duration_seconds)).where(*base_filter)
        )).scalar() or 0

        script_score = (await self.db.execute(
            select(func.avg(ScriptAnalysis.overall_score))
            .join(Call, ScriptAnalysis.call_id == Call.id)
            .where(*base_filter)
        )).scalar()

        sentiment_rows = (await self.db.execute(
            select(EmotionAnalysis.overall_sentiment, func.count())
            .join(Call, EmotionAnalysis.call_id == Call.id)
            .where(*base_filter)
            .group_by(EmotionAnalysis.overall_sentiment)
        )).all()
        sentiment_dist = {str(r[0].value): r[1] for r in sentiment_rows}

        resolved = (await self.db.execute(
            select(func.count()).select_from(CallSummary)
            .join(Call, CallSummary.call_id == Call.id)
            .where(*base_filter, CallSummary.outcome == "resolved")
        )).scalar() or 0
        total_summaries = (await self.db.execute(
            select(func.count()).select_from(CallSummary)
            .join(Call, CallSummary.call_id == Call.id)
            .where(*base_filter)
        )).scalar() or 0
        resolution_rate = (resolved / total_summaries * 100) if total_summaries > 0 else 0

        # Get manager name
        from app.models.manager import Manager
        manager = await self.db.get(Manager, manager_id)
        manager_name = manager.name if manager else "Unknown"

        performance_summary = {
            "total_calls": total,
            "avg_handle_time_sec": round(float(aht), 1),
            "avg_script_score": round(float(script_score), 1) if script_score else None,
            "resolution_rate_pct": round(resolution_rate, 1),
            "sentiment_distribution": sentiment_dist,
        }

        # Get prompt
        prompt_result = await self.db.execute(
            select(AIAgentPrompt).where(
                AIAgentPrompt.ai_agent_id == ai_agent.id,
                AIAgentPrompt.step_type == "coaching",
                AIAgentPrompt.is_active == True,
            )
        )
        custom_prompt = prompt_result.scalar_one_or_none()

        if custom_prompt:
            system_prompt = custom_prompt.system_prompt
            user_template = custom_prompt.user_prompt_template
        else:
            defaults = DEFAULT_PROMPTS["coaching"]
            system_prompt = defaults["system_prompt"]
            user_template = defaults["user_prompt_template"]

        # Call LLM
        client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        user_msg = user_template.format(
            manager_name=manager_name,
            period_start=period_start.strftime("%Y-%m-%d"),
            period_end=period_end.strftime("%Y-%m-%d"),
            performance_summary_json=json.dumps(performance_summary, ensure_ascii=False, indent=2),
        )
        response = await client.chat.completions.create(
            model=ai_agent.model_name or "gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_msg},
            ],
            temperature=ai_agent.temperature or 0.4,
            max_tokens=ai_agent.max_tokens or 3000,
            response_format={"type": "json_object"},
        )

        result_text = response.choices[0].message.content or "[]"
        parsed = json.loads(result_text)
        if isinstance(parsed, dict):
            insights_data = parsed.get("insights", parsed.get("recommendations", []))
        else:
            insights_data = parsed

        # Save insights
        created_insights = []
        for item in insights_data:
            insight = CoachingInsight(
                organization_id=ai_agent.organization_id,
                manager_id=manager_id,
                ai_agent_id=ai_agent.id,
                insight_type=item.get("insight_type", "improvement_area"),
                title=item.get("title", "Untitled"),
                description=item.get("description", ""),
                priority=item.get("priority", "medium"),
                metadata_json={
                    "performance_summary": performance_summary,
                    "period_days": period_days,
                },
            )
            self.db.add(insight)
            created_insights.append(insight)

        await self.db.commit()
        for i in created_insights:
            await self.db.refresh(i)

        return created_insights
