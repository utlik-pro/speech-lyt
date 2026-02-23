"""Pipeline executor — runs an AI agent's configured steps against a call."""

import logging
import time
import uuid
from dataclasses import asdict

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.ai_agent import AIAgent, AIAgentPrompt, AIAgentRun
from app.models.call import Call
from app.models.transcription import Transcription
from app.services.ai_agents.defaults import DEFAULT_PROMPTS
from app.services.ai_agents.steps.base import StepResult
from app.services.ai_agents.steps.coaching import CoachingStep
from app.services.ai_agents.steps.compliance import ScriptComplianceStep
from app.services.ai_agents.steps.custom import CustomAnalysisStep
from app.services.ai_agents.steps.emotion import EmotionAnalysisStep
from app.services.ai_agents.steps.summary import SummaryStep

logger = logging.getLogger(__name__)

# Step registry
STEP_REGISTRY: dict[str, type] = {
    "emotion_analysis": EmotionAnalysisStep,
    "summary": SummaryStep,
    "script_compliance": ScriptComplianceStep,
    "coaching": CoachingStep,
    "custom": CustomAnalysisStep,
}


class PipelineExecutor:
    """Executes an AI agent's pipeline against a call."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def execute(
        self,
        ai_agent: AIAgent,
        call_id: uuid.UUID,
    ) -> AIAgentRun:
        """Run the full pipeline for the given AI agent on a call."""
        start = time.monotonic()

        # 1. Create run record
        run = AIAgentRun(
            ai_agent_id=ai_agent.id,
            call_id=call_id,
            status="running",
        )
        self.db.add(run)
        await self.db.flush()

        # 2. Load call + transcription
        call = await self.db.get(Call, call_id)
        if not call:
            run.status = "failed"
            run.error_message = f"Call {call_id} not found"
            await self.db.commit()
            return run

        result = await self.db.execute(
            select(Transcription).where(Transcription.call_id == call_id)
        )
        transcription = result.scalar_one_or_none()
        if not transcription:
            run.status = "failed"
            run.error_message = "No transcription available for this call"
            await self.db.commit()
            return run

        transcription_text = transcription.full_text or ""
        segments = transcription.segments or []

        # 3. Load custom prompts for this agent
        prompt_result = await self.db.execute(
            select(AIAgentPrompt).where(
                AIAgentPrompt.ai_agent_id == ai_agent.id,
                AIAgentPrompt.is_active == True,
            )
        )
        custom_prompts = {p.step_type: p for p in prompt_result.scalars().all()}

        # 4. Sort and filter enabled steps
        pipeline_steps = sorted(
            [s for s in (ai_agent.pipeline_steps or []) if s.get("enabled", True)],
            key=lambda s: s.get("order", 0),
        )

        step_results: list[dict] = []
        total_input = 0
        total_output = 0

        # 5. Execute each step
        for step_config in pipeline_steps:
            step_type = step_config.get("step_type", "")
            step_class = STEP_REGISTRY.get(step_type)
            if not step_class:
                step_results.append({
                    "step_type": step_type,
                    "status": "skipped",
                    "error": f"Unknown step type: {step_type}",
                })
                continue

            # Get prompt: custom first, then default
            custom = custom_prompts.get(step_type)
            if custom:
                system_prompt = custom.system_prompt
                user_template = custom.user_prompt_template
            else:
                defaults = DEFAULT_PROMPTS.get(step_type, DEFAULT_PROMPTS["custom"])
                system_prompt = defaults["system_prompt"]
                user_template = defaults["user_prompt_template"]

            # Merge config: agent-level + step-level
            config = {
                "model": ai_agent.model_name,
                "temperature": ai_agent.temperature,
                "max_tokens": ai_agent.max_tokens,
            }
            config.update(step_config.get("config", {}))

            # Execute
            step_instance = step_class()
            try:
                result: StepResult = await step_instance.execute(
                    call_id=call_id,
                    transcription_text=transcription_text,
                    segments=segments,
                    config=config,
                    system_prompt=system_prompt,
                    user_prompt_template=user_template,
                    db=self.db,
                )
            except Exception as e:
                logger.error("Step %s failed unexpectedly: %s", step_type, e)
                result = StepResult(
                    step_type=step_type,
                    status="failed",
                    error=str(e),
                )

            step_results.append(asdict(result))
            total_input += result.input_tokens
            total_output += result.output_tokens

        # 6. Update run record
        total_ms = int((time.monotonic() - start) * 1000)
        any_failed = any(r.get("status") == "failed" for r in step_results)
        run.status = "completed" if not any_failed else "completed"  # partial failures still complete
        run.step_results = step_results
        run.total_duration_ms = total_ms
        run.total_input_tokens = total_input
        run.total_output_tokens = total_output

        await self.db.commit()
        await self.db.refresh(run)
        return run
