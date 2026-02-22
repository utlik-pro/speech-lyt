import json
import logging
from dataclasses import dataclass, field

from openai import AsyncOpenAI
from tenacity import retry, retry_if_exception_type, stop_after_attempt, wait_exponential

from app.core.config import settings

logger = logging.getLogger(__name__)


@dataclass
class EmotionTimelineEntry:
    time: float
    sentiment: str  # positive / neutral / negative
    intensity: float  # 0.0 - 1.0


@dataclass
class CriticalMomentEntry:
    time: float
    type: str  # conflict, complaint, gratitude, aggression, escalation
    description: str


@dataclass
class EmotionAnalysisResult:
    overall_sentiment: str
    agent_sentiment: str
    client_sentiment: str
    emotion_timeline: list[EmotionTimelineEntry] = field(default_factory=list)
    critical_moments: list[CriticalMomentEntry] = field(default_factory=list)


SYSTEM_PROMPT = """\
You are an expert call-center conversation analyst. Your task is to analyze the emotional tone \
of a phone conversation between an agent and a client.

You will receive a transcription with timestamped segments. Each segment may have a "speaker" \
field indicating who is talking ("agent", "client", or "unknown").

Analyze the conversation and return a JSON object with the following structure:

{
  "overall_sentiment": "positive" | "neutral" | "negative",
  "agent_sentiment": "positive" | "neutral" | "negative",
  "client_sentiment": "positive" | "neutral" | "negative",
  "emotion_timeline": [
    {"time": <float seconds>, "sentiment": "positive"|"neutral"|"negative", "intensity": <float 0-1>}
  ],
  "critical_moments": [
    {"time": <float seconds>, "type": "<conflict|complaint|gratitude|aggression|escalation>", "description": "<brief description>"}
  ]
}

Guidelines:
- "overall_sentiment" reflects the dominant emotional tone of the entire call.
- "agent_sentiment" reflects how the agent behaved emotionally (professional, rude, empathetic, etc.).
- "client_sentiment" reflects the client's emotional state (satisfied, frustrated, angry, etc.).
- "emotion_timeline" should have 5-15 entries capturing key emotional shifts during the call. \
Use the actual timestamps from the segments.
- "critical_moments" should capture notable events: conflicts, complaints, expressions of gratitude, \
aggression, or escalation. Return an empty list if none are detected.
- "intensity" ranges from 0.0 (very mild) to 1.0 (very strong).
- Return ONLY valid JSON, no markdown fences, no commentary.\
"""


def _format_segments_for_prompt(transcription_text: str, segments: list[dict]) -> str:
    """Format transcription segments into a readable prompt for the LLM."""
    if not segments:
        return f"Full transcription (no individual segments available):\n{transcription_text}"

    lines = []
    for seg in segments:
        speaker = seg.get("speaker", "unknown")
        start = seg.get("start_time", 0.0)
        end = seg.get("end_time", 0.0)
        text = seg.get("text", "").strip()
        if text:
            lines.append(f"[{start:.1f}s - {end:.1f}s] {speaker}: {text}")

    if not lines:
        return f"Full transcription (segments had no text):\n{transcription_text}"

    return "Conversation transcript:\n" + "\n".join(lines)


class EmotionAnalyzer:
    """Analyzes emotional tone of call-center conversations using OpenAI GPT."""

    def __init__(self) -> None:
        self._client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=30),
        retry=retry_if_exception_type((TimeoutError, ConnectionError)),
        before_sleep=lambda retry_state: logger.warning(
            f"EmotionAnalyzer retry #{retry_state.attempt_number}: {retry_state.outcome.exception()}"
        ),
    )
    async def analyze(
        self,
        transcription_text: str,
        segments: list[dict],
    ) -> EmotionAnalysisResult:
        """Analyze the emotional tone of a conversation.

        Args:
            transcription_text: Full text of the transcription.
            segments: List of segment dicts with keys: speaker, text, start_time, end_time.

        Returns:
            EmotionAnalysisResult with sentiment analysis and critical moments.
        """
        user_content = _format_segments_for_prompt(transcription_text, segments)

        logger.info(
            "Running emotion analysis: %d segments, %d chars of text",
            len(segments),
            len(transcription_text),
        )

        response = await self._client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_content},
            ],
            temperature=0.3,
            max_tokens=2048,
            response_format={"type": "json_object"},
        )

        raw = response.choices[0].message.content
        if not raw:
            logger.error("Empty response from OpenAI emotion analysis")
            return EmotionAnalysisResult(
                overall_sentiment="neutral",
                agent_sentiment="neutral",
                client_sentiment="neutral",
            )

        try:
            data = json.loads(raw)
        except json.JSONDecodeError as exc:
            logger.error("Failed to parse emotion analysis JSON: %s — raw: %s", exc, raw[:500])
            return EmotionAnalysisResult(
                overall_sentiment="neutral",
                agent_sentiment="neutral",
                client_sentiment="neutral",
            )

        # Validate sentiment values
        valid_sentiments = {"positive", "neutral", "negative"}

        overall = data.get("overall_sentiment", "neutral")
        if overall not in valid_sentiments:
            overall = "neutral"

        agent = data.get("agent_sentiment", "neutral")
        if agent not in valid_sentiments:
            agent = "neutral"

        client = data.get("client_sentiment", "neutral")
        if client not in valid_sentiments:
            client = "neutral"

        # Parse timeline
        timeline_raw = data.get("emotion_timeline", [])
        timeline: list[EmotionTimelineEntry] = []
        for entry in timeline_raw:
            try:
                sentiment = entry.get("sentiment", "neutral")
                if sentiment not in valid_sentiments:
                    sentiment = "neutral"
                timeline.append(
                    EmotionTimelineEntry(
                        time=float(entry.get("time", 0.0)),
                        sentiment=sentiment,
                        intensity=max(0.0, min(1.0, float(entry.get("intensity", 0.5)))),
                    )
                )
            except (TypeError, ValueError) as exc:
                logger.warning("Skipping invalid timeline entry %s: %s", entry, exc)

        # Parse critical moments
        moments_raw = data.get("critical_moments", [])
        moments: list[CriticalMomentEntry] = []
        for entry in moments_raw:
            try:
                moments.append(
                    CriticalMomentEntry(
                        time=float(entry.get("time", 0.0)),
                        type=str(entry.get("type", "unknown")),
                        description=str(entry.get("description", "")),
                    )
                )
            except (TypeError, ValueError) as exc:
                logger.warning("Skipping invalid critical moment %s: %s", entry, exc)

        logger.info(
            "Emotion analysis complete: overall=%s, agent=%s, client=%s, "
            "timeline_points=%d, critical_moments=%d",
            overall,
            agent,
            client,
            len(timeline),
            len(moments),
        )

        return EmotionAnalysisResult(
            overall_sentiment=overall,
            agent_sentiment=agent,
            client_sentiment=client,
            emotion_timeline=timeline,
            critical_moments=moments,
        )
