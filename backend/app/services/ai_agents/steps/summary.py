"""Summary generation pipeline step."""

import json
import logging
import time
import uuid

from openai import AsyncOpenAI
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.services.ai_agents.steps.base import StepResult

logger = logging.getLogger(__name__)


class SummaryStep:
    step_type = "summary"

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
        start = time.monotonic()
        try:
            client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
            user_msg = user_prompt_template.format(transcription_text=transcription_text)
            response = await client.chat.completions.create(
                model=config.get("model", "gpt-4o-mini"),
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_msg},
                ],
                temperature=config.get("temperature", 0.2),
                max_tokens=config.get("max_tokens", 2048),
                response_format={"type": "json_object"},
            )
            result_text = response.choices[0].message.content or "{}"
            result_data = json.loads(result_text)
            duration_ms = int((time.monotonic() - start) * 1000)
            return StepResult(
                step_type=self.step_type,
                status="completed",
                result=result_data,
                duration_ms=duration_ms,
                input_tokens=response.usage.prompt_tokens if response.usage else 0,
                output_tokens=response.usage.completion_tokens if response.usage else 0,
            )
        except Exception as e:
            logger.error("Summary step failed: %s", e)
            return StepResult(
                step_type=self.step_type,
                status="failed",
                duration_ms=int((time.monotonic() - start) * 1000),
                error=str(e),
            )
