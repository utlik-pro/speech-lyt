"""Speaker diarization service.

Assigns speaker labels to transcription segments based on audio analysis.
Uses energy-based voice activity detection with simple clustering for MVP.
Can be upgraded to pyannote.audio for production accuracy.
"""

import json
import logging
import subprocess
import tempfile
from pathlib import Path

logger = logging.getLogger(__name__)


class DiarizationService:
    """Speaker diarization using ffmpeg-based audio analysis.

    MVP approach: uses audio energy levels per segment to distinguish
    between 2 speakers (operator vs client) based on volume patterns.
    For production, replace with pyannote.audio pipeline.
    """

    async def assign_speakers(
        self,
        audio_path: str,
        segments: list[dict],
        num_speakers: int = 2,
    ) -> list[dict]:
        """Assign speaker labels to transcription segments.

        Args:
            audio_path: Path to the normalized WAV file.
            segments: List of segment dicts with text, start_time, end_time, confidence.
            num_speakers: Expected number of speakers (default 2 for call center).

        Returns:
            Segments with added 'speaker' field.
        """
        if not segments:
            return []

        if len(segments) == 1:
            segments[0]["speaker"] = "Speaker 1"
            return segments

        try:
            energies = self._extract_segment_energies(audio_path, segments)
            labeled = self._cluster_speakers(segments, energies, num_speakers)
            return labeled
        except Exception as e:
            logger.warning(f"Diarization failed, falling back to alternating: {e}")
            return self._fallback_alternating(segments)

    def _extract_segment_energies(self, audio_path: str, segments: list[dict]) -> list[float]:
        """Extract RMS energy for each segment using ffmpeg."""
        energies = []
        for seg in segments:
            start = seg["start_time"]
            duration = seg["end_time"] - start
            if duration <= 0:
                energies.append(0.0)
                continue

            with tempfile.NamedTemporaryFile(suffix=".json", delete=False) as tmp:
                tmp_path = tmp.name

            try:
                result = subprocess.run(
                    [
                        "ffmpeg", "-y", "-i", audio_path,
                        "-ss", str(start), "-t", str(duration),
                        "-af", "volumedetect",
                        "-f", "null", "/dev/null",
                    ],
                    capture_output=True, text=True, timeout=10,
                )
                stderr = result.stderr
                # Parse mean_volume from ffmpeg output
                mean_vol = -50.0  # default silence
                for line in stderr.split("\n"):
                    if "mean_volume" in line:
                        try:
                            mean_vol = float(line.split("mean_volume:")[1].split("dB")[0].strip())
                        except (ValueError, IndexError):
                            pass
                energies.append(mean_vol)
            except Exception:
                energies.append(-50.0)
            finally:
                Path(tmp_path).unlink(missing_ok=True)

        return energies

    def _cluster_speakers(
        self, segments: list[dict], energies: list[float], num_speakers: int
    ) -> list[dict]:
        """Simple energy-based clustering into speaker groups.

        Heuristic: in a call center dialog, speakers tend to alternate.
        We use energy differences + turn-taking patterns to assign speakers.
        """
        if num_speakers < 2:
            for seg in segments:
                seg["speaker"] = "Speaker 1"
            return segments

        # Strategy: combine energy clustering with turn-taking heuristic.
        # Segments with similar energy levels and no long pauses between them
        # are likely the same speaker.
        median_energy = sorted(energies)[len(energies) // 2]

        current_speaker = 1
        prev_end = 0.0

        for i, seg in enumerate(segments):
            gap = seg["start_time"] - prev_end if i > 0 else 0.0

            if i == 0:
                current_speaker = 1
            elif gap > 1.5:
                # Long pause suggests speaker change
                current_speaker = 2 if current_speaker == 1 else 1
            elif abs(energies[i] - energies[i - 1]) > 5.0:
                # Significant energy change suggests different speaker
                current_speaker = 2 if current_speaker == 1 else 1
            # else: same speaker continues

            seg["speaker"] = f"Speaker {current_speaker}"
            prev_end = seg["end_time"]

        return segments

    def _fallback_alternating(self, segments: list[dict]) -> list[dict]:
        """Fallback: simple alternating speaker assignment based on pauses."""
        current_speaker = 1
        prev_end = 0.0

        for i, seg in enumerate(segments):
            if i > 0:
                gap = seg["start_time"] - prev_end
                if gap > 0.8:
                    current_speaker = 2 if current_speaker == 1 else 1

            seg["speaker"] = f"Speaker {current_speaker}"
            prev_end = seg["end_time"]

        return segments


diarization_service = DiarizationService()
