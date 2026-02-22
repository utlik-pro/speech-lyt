import logging

from app.services.asr.base import ASRProvider, TranscriptionResult
from app.services.asr.whisper import WhisperASRProvider

logger = logging.getLogger(__name__)

# Registry of available ASR providers
_providers: dict[str, type[ASRProvider]] = {
    "openai-whisper": WhisperASRProvider,
}

_instances: dict[str, ASRProvider] = {}


def get_asr_provider(name: str = "openai-whisper") -> ASRProvider:
    """Get an ASR provider instance by name."""
    if name not in _providers:
        raise ValueError(f"Unknown ASR provider: {name}. Available: {list(_providers.keys())}")

    if name not in _instances:
        _instances[name] = _providers[name]()

    return _instances[name]


def register_asr_provider(name: str, provider_class: type[ASRProvider]):
    """Register a new ASR provider (for plugins/extensions)."""
    _providers[name] = provider_class
    logger.info(f"Registered ASR provider: {name}")


async def transcribe_audio(
    audio_path: str,
    language: str | None = None,
    provider_name: str = "openai-whisper",
) -> TranscriptionResult:
    """High-level transcription function with provider selection."""
    provider = get_asr_provider(provider_name)
    logger.info(f"Transcribing with provider: {provider.name}")
    return await provider.transcribe(audio_path, language=language)
