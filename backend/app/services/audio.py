import json
import subprocess
import tempfile
import uuid
from dataclasses import dataclass
from pathlib import Path

from app.core.config import settings


@dataclass
class AudioInfo:
    duration_seconds: float
    sample_rate: int
    channels: int
    format: str


class AudioService:
    """Audio file validation, normalization, and metadata extraction using ffmpeg/ffprobe."""

    SUPPORTED_FORMATS = settings.SUPPORTED_AUDIO_FORMATS
    MAX_SIZE_BYTES = settings.MAX_AUDIO_SIZE_MB * 1024 * 1024

    def validate_format(self, filename: str) -> str:
        ext = Path(filename).suffix.lower().lstrip(".")
        if ext not in self.SUPPORTED_FORMATS:
            raise ValueError(
                f"Unsupported format: .{ext}. Supported: {', '.join(self.SUPPORTED_FORMATS)}"
            )
        return ext

    def validate_size(self, size: int):
        if size > self.MAX_SIZE_BYTES:
            raise ValueError(
                f"File too large: {size / 1024 / 1024:.1f}MB. Max: {settings.MAX_AUDIO_SIZE_MB}MB"
            )

    def get_audio_info(self, data: bytes, fmt: str) -> AudioInfo:
        """Extract audio metadata using ffprobe."""
        with tempfile.NamedTemporaryFile(suffix=f".{fmt}", delete=False) as tmp:
            tmp.write(data)
            tmp_path = tmp.name

        try:
            result = subprocess.run(
                [
                    "ffprobe", "-v", "quiet", "-print_format", "json",
                    "-show_format", "-show_streams", tmp_path,
                ],
                capture_output=True, text=True, timeout=30,
            )
            if result.returncode != 0:
                raise ValueError(f"ffprobe failed: {result.stderr}")

            probe = json.loads(result.stdout)
            audio_stream = next(
                (s for s in probe.get("streams", []) if s["codec_type"] == "audio"), None
            )
            if not audio_stream:
                raise ValueError("No audio stream found in file")

            return AudioInfo(
                duration_seconds=float(probe["format"]["duration"]),
                sample_rate=int(audio_stream["sample_rate"]),
                channels=int(audio_stream["channels"]),
                format=fmt,
            )
        finally:
            Path(tmp_path).unlink(missing_ok=True)

    def normalize_to_wav(self, data: bytes, fmt: str) -> bytes:
        """Convert to 16kHz mono WAV for ASR processing using ffmpeg."""
        with tempfile.NamedTemporaryFile(suffix=f".{fmt}", delete=False) as tmp_in:
            tmp_in.write(data)
            in_path = tmp_in.name

        out_path = in_path + ".normalized.wav"

        try:
            result = subprocess.run(
                [
                    "ffmpeg", "-y", "-i", in_path,
                    "-ar", "16000", "-ac", "1", "-f", "wav", out_path,
                ],
                capture_output=True, text=True, timeout=120,
            )
            if result.returncode != 0:
                raise ValueError(f"ffmpeg normalization failed: {result.stderr}")

            return Path(out_path).read_bytes()
        finally:
            Path(in_path).unlink(missing_ok=True)
            Path(out_path).unlink(missing_ok=True)

    def export_to_tempfile(self, data: bytes, fmt: str) -> str:
        """Convert to 16kHz mono WAV temp file (for Whisper API)."""
        with tempfile.NamedTemporaryFile(suffix=f".{fmt}", delete=False) as tmp_in:
            tmp_in.write(data)
            in_path = tmp_in.name

        out_path = str(Path(tempfile.gettempdir()) / f"{uuid.uuid4()}.wav")

        result = subprocess.run(
            [
                "ffmpeg", "-y", "-i", in_path,
                "-ar", "16000", "-ac", "1", "-f", "wav", out_path,
            ],
            capture_output=True, text=True, timeout=120,
        )
        Path(in_path).unlink(missing_ok=True)

        if result.returncode != 0:
            raise ValueError(f"ffmpeg conversion failed: {result.stderr}")

        return out_path


audio_service = AudioService()
