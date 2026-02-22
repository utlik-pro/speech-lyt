import json
import logging
from dataclasses import dataclass, field

from openai import AsyncOpenAI
from tenacity import retry, retry_if_exception_type, stop_after_attempt, wait_exponential

from app.core.config import settings

logger = logging.getLogger(__name__)


@dataclass
class EntityResult:
    name: str
    type: str
    value: str


@dataclass
class SummaryResult:
    short_summary: str = ""
    topic: str = ""
    problem: str | None = None
    solution: str | None = None
    outcome: str = "unresolved"
    next_steps: str | None = None
    entities: list[EntityResult] = field(default_factory=list)
    tags: list[str] = field(default_factory=list)
    category: str | None = None


SYSTEM_PROMPT = """\
You are an expert call center analyst. You analyze call transcriptions and produce structured summaries.

You MUST respond with valid JSON only, no extra text.

JSON schema:
{
  "short_summary": "2-3 sentence summary of the call",
  "topic": "main topic of the call (concise phrase)",
  "problem": "what problem the client had, or null if not applicable",
  "solution": "how the problem was resolved, or null if not resolved",
  "outcome": "one of: resolved, unresolved, escalated, callback",
  "next_steps": "what needs to happen next, or null",
  "entities": [
    {"name": "entity label (e.g. client_name, contract_number, amount, date, product)", "type": "person|number|date|amount|product|organization", "value": "extracted value"}
  ],
  "tags": ["tag1", "tag2", "..."],
  "category": "one of: technical_support, billing, sales, complaint, general_inquiry, account_management, cancellation, feedback, other"
}

Rules:
- short_summary: concise 2-3 sentences capturing the essence of the call.
- topic: a short phrase describing the main subject.
- problem: describe the client's issue. null if no clear problem.
- solution: describe how it was resolved. null if not resolved.
- outcome: must be exactly one of: resolved, unresolved, escalated, callback.
- next_steps: concrete next actions. null if none.
- entities: extract ALL mentioned names, phone numbers, contract/order numbers, monetary amounts, dates, and product names. Use descriptive labels.
- tags: 3-8 relevant tags for search and filtering.
- category: pick the single best-fitting category from the list above.
- If the transcription is in Russian or another language, still produce the JSON keys in English, but values can be in the original language.
"""

USER_PROMPT_TEMPLATE = """\
Analyze the following call transcription and produce a structured JSON summary.

TRANSCRIPTION:
{transcription_text}
"""


class SummaryGenerator:
    """Generates structured call summaries using OpenAI GPT."""

    def __init__(self) -> None:
        self._client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=30),
        retry=retry_if_exception_type((TimeoutError, ConnectionError)),
        before_sleep=lambda retry_state: logger.warning(
            f"OpenAI summary retry #{retry_state.attempt_number}: {retry_state.outcome.exception()}"
        ),
    )
    async def generate(
        self,
        transcription_text: str,
        segments: list[dict] | None = None,
    ) -> SummaryResult:
        """Generate a structured call summary from transcription text.

        Args:
            transcription_text: Full transcription text of the call.
            segments: Optional list of segment dicts with speaker/text/timestamps.
                      If provided, they are formatted into the prompt for better context.

        Returns:
            SummaryResult dataclass with all extracted fields.
        """
        # Build the transcription block. If segments with speakers are available,
        # format them as a dialog for richer context.
        formatted_text = self._format_transcription(transcription_text, segments)

        if not formatted_text.strip():
            logger.warning("Empty transcription text provided to SummaryGenerator")
            return SummaryResult(
                short_summary="Empty transcription — no summary available.",
                topic="unknown",
                outcome="unresolved",
                tags=["empty_transcription"],
            )

        user_prompt = USER_PROMPT_TEMPLATE.format(transcription_text=formatted_text)

        logger.info(
            f"Generating call summary (text length: {len(formatted_text)} chars, "
            f"segments: {len(segments) if segments else 0})"
        )

        response = await self._client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.2,
            max_tokens=2048,
            response_format={"type": "json_object"},
        )

        raw_content = response.choices[0].message.content or "{}"
        logger.debug(f"Raw LLM response: {raw_content[:500]}")

        return self._parse_response(raw_content)

    @staticmethod
    def _format_transcription(
        transcription_text: str,
        segments: list[dict] | None = None,
    ) -> str:
        """Format transcription for the prompt, preferring speaker-attributed dialog."""
        if segments:
            lines: list[str] = []
            for seg in segments:
                speaker = seg.get("speaker", "Unknown")
                text = seg.get("text", "").strip()
                if text:
                    lines.append(f"[{speaker}]: {text}")
            if lines:
                return "\n".join(lines)

        # Fallback to plain text
        return transcription_text

    @staticmethod
    def _parse_response(raw_json: str) -> SummaryResult:
        """Parse the JSON response from the LLM into a SummaryResult."""
        try:
            data = json.loads(raw_json)
        except json.JSONDecodeError:
            logger.error(f"Failed to parse LLM JSON response: {raw_json[:300]}")
            return SummaryResult(
                short_summary="Error: failed to parse AI response.",
                topic="unknown",
                outcome="unresolved",
                tags=["parse_error"],
            )

        # Parse entities
        raw_entities = data.get("entities") or []
        entities: list[EntityResult] = []
        for ent in raw_entities:
            if isinstance(ent, dict) and "name" in ent and "type" in ent and "value" in ent:
                entities.append(
                    EntityResult(
                        name=str(ent["name"]),
                        type=str(ent["type"]),
                        value=str(ent["value"]),
                    )
                )

        # Validate outcome
        valid_outcomes = {"resolved", "unresolved", "escalated", "callback"}
        outcome = data.get("outcome", "unresolved")
        if outcome not in valid_outcomes:
            logger.warning(f"Invalid outcome '{outcome}', defaulting to 'unresolved'")
            outcome = "unresolved"

        # Parse tags
        raw_tags = data.get("tags") or []
        tags = [str(t) for t in raw_tags if isinstance(t, str)]

        return SummaryResult(
            short_summary=data.get("short_summary", ""),
            topic=data.get("topic", ""),
            problem=data.get("problem"),
            solution=data.get("solution"),
            outcome=outcome,
            next_steps=data.get("next_steps"),
            entities=entities,
            tags=tags,
            category=data.get("category"),
        )
