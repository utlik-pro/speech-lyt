import logging
from pathlib import Path

from openai import AsyncOpenAI
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

from app.core.config import settings
from app.services.asr.base import ASRProvider, TranscriptionResult, TranscriptionSegment

logger = logging.getLogger(__name__)


class WhisperASRProvider(ASRProvider):
    """OpenAI Whisper API provider for speech-to-text."""

    def __init__(self):
        self._client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

    @property
    def name(self) -> str:
        return "openai-whisper"

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=30),
        retry=retry_if_exception_type((TimeoutError, ConnectionError)),
        before_sleep=lambda retry_state: logger.warning(
            f"Whisper API retry #{retry_state.attempt_number}: {retry_state.outcome.exception()}"
        ),
    )
    async def transcribe(
        self,
        audio_path: str,
        language: str | None = None,
    ) -> TranscriptionResult:
        """Transcribe audio file using Whisper API with word-level timestamps."""
        path = Path(audio_path)
        if not path.exists():
            raise FileNotFoundError(f"Audio file not found: {audio_path}")

        file_size = path.stat().st_size
        if file_size > 25 * 1024 * 1024:  # Whisper API limit: 25MB
            raise ValueError(f"File too large for Whisper API: {file_size / 1024 / 1024:.1f}MB (max 25MB)")

        logger.info(f"Transcribing {audio_path} (size: {file_size / 1024:.0f}KB, lang: {language or 'auto'})")

        with open(audio_path, "rb") as audio_file:
            response = await self._client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
                language=language or "ru",
                response_format="verbose_json",
                timestamp_granularities=["segment"],
            )

        # Parse segments from response
        segments = []
        if hasattr(response, "segments") and response.segments:
            for seg in response.segments:
                segments.append(
                    TranscriptionSegment(
                        text=seg.get("text", "").strip() if isinstance(seg, dict) else seg.text.strip(),
                        start_time=seg.get("start", 0.0) if isinstance(seg, dict) else seg.start,
                        end_time=seg.get("end", 0.0) if isinstance(seg, dict) else seg.end,
                        confidence=seg.get("avg_logprob", 0.0) if isinstance(seg, dict) else getattr(seg, "avg_logprob", 0.0),
                    )
                )

        detected_lang = getattr(response, "language", language or "ru")
        duration = getattr(response, "duration", 0.0)
        full_text = response.text.strip() if hasattr(response, "text") else ""

        logger.info(
            f"Transcription complete: {len(segments)} segments, "
            f"lang={detected_lang}, duration={duration:.1f}s, "
            f"text_length={len(full_text)} chars"
        )

        return TranscriptionResult(
            full_text=full_text,
            segments=segments,
            language=detected_lang,
            provider=self.name,
            model="whisper-1",
            duration_seconds=duration or 0.0,
        )

    async def transcribe_stream(self, audio_stream, language: str | None = None) -> TranscriptionResult:
        """Real-time transcription — not yet supported by Whisper API. Phase 2."""
        raise NotImplementedError("Streaming transcription is not yet supported by Whisper API")
