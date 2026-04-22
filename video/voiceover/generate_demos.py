#!/usr/bin/env python3.11
"""Demo-семплы разных голосов ElevenLabs одной фразой для выбора.

Запуск:
    ELEVENLABS_API_KEY=sk_... python3.11 video/voiceover/generate_demos.py
"""

from __future__ import annotations

import os
import sys
from pathlib import Path

import requests

API = "https://api.elevenlabs.io/v1"
MODEL = "eleven_multilingual_v2"

# Тестовая фраза — комбо самых частых слов из ролика
PHRASE = (
    "От девятисот девяноста белорусских рублей в месяц. "
    "Аудит вашего контакт-центра — тысяча пятьсот рублей, семь дней. "
    "Гарантия плюс пятнадцать процентов качества за девяносто дней."
)

VOICES = [
    ("ru01_petrkh",   "PX4ZIDp1D0OFpm76rx1Y", "Petr — мужской русский, нативный"),
    ("ru02_roman",    "O88Glmkh2nWihrGwNsFd", "Roman — тёплый баритон, для рассказа"),
    ("ru03_leonid",   "bg9LrEYQkRYwqkxA8VOy", "Leonid Fomichev — мужской русский, реалистичный"),
    ("ru04_anton",    "13JzN9jg1ViUP8Pf3uet", "Anton — мужской русский, чистый"),
    ("ru05_max",      "Uv3rf12Omd9Asyv54Bqw", "Max — живой и эмоциональный мужской"),
    ("ru06_paul",     "O9f5Hqzk8FPymrA0cAZq", "Paul — мужской, телефонный (как у саппорта)"),
    ("ru07_arina",    "ELWVgJ5Mo9lF5Tha9ahW", "Arina — женский русский, нативный"),
    ("ru08_elena_t",  "dJLURfd0OIfcFXn6H1Hq", "Elena Tymanova — женский профессиональный"),
    ("ru09_lisa",     "CamFZN2KIaqnyvcaFe3E", "Lisa — женский, уверенный с эмоциями"),
    ("ru10_elena_g",  "0ArNnoIAWKlT4WweaVMY", "Elena Gromova — женский, для подкастов"),
]


def gen(api_key, voice_id, text, out_path):
    r = requests.post(
        f"{API}/text-to-speech/{voice_id}?output_format=mp3_44100_128",
        headers={"xi-api-key": api_key, "Content-Type": "application/json"},
        json={
            "text": text,
            "model_id": MODEL,
            "voice_settings": {
                "stability": 0.55,
                "similarity_boost": 0.75,
                "style": 0.35,
                "use_speaker_boost": True,
            },
        },
        timeout=60,
    )
    if r.status_code != 200:
        print(f"  ✗ {r.status_code}: {r.text[:200]}")
        return False
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_bytes(r.content)
    return True


def main():
    api_key = os.environ.get("ELEVENLABS_API_KEY")
    if not api_key:
        print("ERROR: ELEVENLABS_API_KEY not set")
        sys.exit(1)

    out_dir = Path(__file__).parent / "voices_demo"
    out_dir.mkdir(exist_ok=True)

    chars = len(PHRASE)
    cost = chars * len(VOICES) / 1000 * 0.30
    print(f"Phrase: {chars} chars × {len(VOICES)} voices = ~${cost:.3f}\n")

    for slug, voice_id, desc in VOICES:
        out_path = out_dir / f"{slug}.mp3"
        print(f"  → {slug}: {desc}")
        if not gen(api_key, voice_id, PHRASE, out_path):
            continue

    print(f"\n✓ Done. Files in {out_dir}")


if __name__ == "__main__":
    main()
