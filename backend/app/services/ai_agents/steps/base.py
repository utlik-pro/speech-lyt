"""Base protocol for pipeline steps."""

from dataclasses import dataclass, field
from typing import Protocol

import uuid

from sqlalchemy.ext.asyncio import AsyncSession


@dataclass
class StepResult:
    """Result of a single pipeline step execution."""

    step_type: str
    status: str  # "completed" | "failed" | "skipped"
    result: dict = field(default_factory=dict)
    duration_ms: int = 0
    input_tokens: int = 0
    output_tokens: int = 0
    error: str | None = None


class PipelineStep(Protocol):
    """Protocol that all pipeline steps must implement."""

    step_type: str

    async def execute(
        self,
        call_id: uuid.UUID,
        transcription_text: str,
        segments: list[dict],
        config: dict,
        system_prompt: str,
        user_prompt_template: str,
        db: AsyncSession,
    ) -> StepResult: ...
