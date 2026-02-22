from abc import ABC, abstractmethod
from dataclasses import dataclass, field


@dataclass
class TranscriptionSegment:
    text: str
    start_time: float
    end_time: float
    speaker: str = "unknown"  # will be set by diarization
    confidence: float = 1.0


@dataclass
class TranscriptionResult:
    full_text: str
    segments: list[TranscriptionSegment] = field(default_factory=list)
    language: str = "ru"
    provider: str = "unknown"
    model: str = "unknown"
    duration_seconds: float = 0.0


class ASRProvider(ABC):
    """Abstract base class for ASR providers (adapter pattern)."""

    @property
    @abstractmethod
    def name(self) -> str:
        """Provider name identifier."""
        ...

    @abstractmethod
    async def transcribe(
        self,
        audio_path: str,
        language: str | None = None,
    ) -> TranscriptionResult:
        """Transcribe audio file and return result with segments."""
        ...

    @abstractmethod
    async def transcribe_stream(
        self,
        audio_stream,
        language: str | None = None,
    ) -> TranscriptionResult:
        """Transcribe audio stream (for real-time, Phase 2)."""
        ...
