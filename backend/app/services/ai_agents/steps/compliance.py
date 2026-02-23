"""Script compliance analysis pipeline step."""

import json
import logging
import time
import uuid

from openai import AsyncOpenAI
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.services.ai_agents.steps.base import StepResult

logger = logging.getLogger(__name__)


class ScriptComplianceStep:
    step_type = "script_compliance"

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
            # Load script stages if script_id provided in config
            stages_json = "[]"
            script_id = config.get("script_id")
            if script_id:
                from app.models.script import Script
                script = await db.get(Script, uuid.UUID(script_id))
                if script and script.stages:
                    stages_json = json.dumps(
                        [{"id": str(s.id), "name": s.name, "required_phrases": s.required_phrases}
                         for s in script.stages],
                        ensure_ascii=False,
                    )

            client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
            user_msg = user_prompt_template.format(
                transcription_text=transcription_text,
                stages_json=stages_json,
            )
            response = await client.chat.completions.create(
                model=config.get("model", "gpt-4o-mini"),
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_msg},
                ],
                temperature=config.get("temperature", 0.1),
                max_tokens=config.get("max_tokens", 4000),
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
            logger.error("Script compliance step failed: %s", e)
            return StepResult(
                step_type=self.step_type,
                status="failed",
                duration_ms=int((time.monotonic() - start) * 1000),
                error=str(e),
            )
