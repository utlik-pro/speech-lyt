#!/usr/bin/env python3.11
"""ElevenLabs voiceover для SpeechLyt hero-видео.

Адаптировано из tender-ai/video/voiceover/generate_voiceover.py.
Голос Brian (низкий мужской, авторитетный) — ID nPczCjzI2devNBz1zQrb.

Запуск:
    ELEVENLABS_API_KEY=sk_... python3.11 video/voiceover/generate_elevenlabs.py
    # или с другим голосом:
    ELEVENLABS_VOICE_ID=pNInz6obpgDQGcFmaJgB python3.11 video/voiceover/generate_elevenlabs.py

Стоимость: ~$0.30 / 1000 символов. Для 60-сек ролика ~$0.10.
"""

from __future__ import annotations

import json
import os
import subprocess
import sys
from pathlib import Path

try:
    import requests
except ImportError:
    print("ERROR: pip install requests", file=sys.stderr)
    sys.exit(1)

ELEVENLABS_API = "https://api.elevenlabs.io/v1"
VOICE_ID_DEFAULT = "nPczCjzI2devNBz1zQrb"  # Brian — глубокий мужской, авторитетный
MODEL_ID = "eleven_multilingual_v2"

SEGMENTS = [
    {
        "id": "01_hook",
        "caption": "Только 5% звонков проверяете вручную. Остальные 95% — слепая зона.",
        "text": "Только пять процентов звонков вы проверяете вручную. Остальные девяносто пять процентов — слепая зона."
    },
    {
        "id": "02_solution",
        "caption": "SpeechLyt анализирует 100% звонков. Whisper. Эмоции. Скрипты.",
        "text": "Спич Лит анализирует сто процентов звонков. Транскрипция, эмоции, скрипты."
    },
    {
        "id": "03_calls_list",
        "caption": "Все звонки в одном месте. С транскрипцией и метриками.",
        "text": "Все звонки в одном месте. С транскрипцией и ключевыми метриками."
    },
    {
        "id": "04_call_detail",
        "caption": "Полная транскрипция, эмоции по таймлайну, нарушения скрипта.",
        "text": "Полная транскрипция, эмоции по таймлайну, нарушения скрипта на виду."
    },
    {
        "id": "05_qa_dashboard",
        "caption": "Авто-QA: AI заполняет 80% полей. Супервайзер только утверждает.",
        "text": "Автоматический контроль качества. Искусственный интеллект заполняет восемьдесят процентов полей. Супервайзер только утверждает."
    },
    {
        "id": "06_pricing",
        "caption": "От 990 BYN/мес. Гарантия +15% качества за 90 дней или возврат.",
        "text": "От девятисот девяноста белорусских рублей в месяц. Гарантия плюс пятнадцать процентов качества за девяносто дней — или возврат."
    },
    {
        "id": "07_cta",
        "caption": "Аудит за 1 500 BYN. 7 дней. Сегодня.",
        "text": "Аудит вашего контакт-центра. Тысяча пятьсот рублей. Семь дней. Сегодня."
    }
]


def load_api_key() -> str:
    key = os.environ.get("ELEVENLABS_API_KEY")
    if not key:
        print("ERROR: ELEVENLABS_API_KEY not set", file=sys.stderr)
        sys.exit(1)
    return key


def generate_segment(api_key: str, voice_id: str, text: str, out_path: Path) -> None:
    headers = {"xi-api-key": api_key, "Content-Type": "application/json"}
    payload = {
        "text": text,
        "model_id": MODEL_ID,
        "voice_settings": {
            "stability": 0.55,
            "similarity_boost": 0.75,
            "style": 0.35,
            "use_speaker_boost": True
        }
    }
    r = requests.post(
        f"{ELEVENLABS_API}/text-to-speech/{voice_id}?output_format=mp3_44100_128",
        headers=headers,
        json=payload,
        timeout=60
    )
    if r.status_code != 200:
        raise RuntimeError(f"ElevenLabs error {r.status_code}: {r.text[:300]}")
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_bytes(r.content)


def probe_duration(path: Path) -> float:
    r = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=noprint_wrappers=1:nokey=1", str(path)],
        capture_output=True, text=True
    )
    return float(r.stdout.strip())


def concat_segments_with_gaps(segment_paths, gap_sec, out_path):
    concat_file = out_path.parent / "concat.txt"
    silence_path = out_path.parent / f"silence_{int(gap_sec * 1000)}ms.mp3"
    if not silence_path.exists():
        subprocess.run([
            "ffmpeg", "-y", "-loglevel", "error",
            "-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo",
            "-t", str(gap_sec), "-q:a", "9", "-acodec", "libmp3lame", str(silence_path)
        ], check=True)

    lines = []
    for i, p in enumerate(segment_paths):
        lines.append(f"file '{p.resolve()}'")
        if i < len(segment_paths) - 1:
            lines.append(f"file '{silence_path.resolve()}'")
    concat_file.write_text("\n".join(lines))

    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0",
         "-i", str(concat_file), "-c:a", "libmp3lame", "-b:a", "192k", str(out_path)],
        check=True
    )
    concat_file.unlink()


def main() -> int:
    api_key = load_api_key()
    voice_id = os.environ.get("ELEVENLABS_VOICE_ID", VOICE_ID_DEFAULT)

    out_dir = Path(__file__).parent / "out"
    out_dir.mkdir(parents=True, exist_ok=True)

    for old in out_dir.glob("0*.mp3"):
        old.unlink()
    for old in [out_dir / "voiceover_full.mp3"]:
        if old.exists():
            old.unlink()

    GAP = 0.4
    segment_paths = []
    total_chars = 0
    timeline = []
    cursor_time = 0.0

    print(f"[el] Voice: {voice_id}")
    print(f"[el] Model: {MODEL_ID}")
    print()

    for seg in SEGMENTS:
        out_path = out_dir / f"{seg['id']}.mp3"
        print(f"[el]  {seg['id']} ({len(seg['text'])} симв.)")
        generate_segment(api_key, voice_id, seg["text"], out_path)
        dur = probe_duration(out_path)
        segment_paths.append(out_path)
        total_chars += len(seg["text"])

        timeline.append({
            "id": seg["id"],
            "caption": seg["caption"],
            "text": seg["text"],
            "start_sec": round(cursor_time, 2),
            "duration_sec": round(dur, 2),
            "end_sec": round(cursor_time + dur, 2)
        })
        cursor_time += dur + GAP
        print(f"       {dur:.2f}s  [{timeline[-1]['start_sec']:.2f}..{timeline[-1]['end_sec']:.2f}]")

    total = cursor_time - GAP
    print(f"\n[el] Итого: {total:.1f}s")

    full_path = out_dir / "voiceover_full.mp3"
    concat_segments_with_gaps(segment_paths, GAP, full_path)
    print(f"[el] ✓ {full_path}")

    timeline_path = out_dir / "segments.json"
    timeline_path.write_text(json.dumps({
        "gap_sec": GAP,
        "total_sec": round(total, 2),
        "segments": timeline
    }, ensure_ascii=False, indent=2))
    print(f"[el] ✓ timeline: {timeline_path}")

    cost = total_chars / 1000 * 0.30
    print(f"\n[el] {total_chars} символов, ~${cost:.3f}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
