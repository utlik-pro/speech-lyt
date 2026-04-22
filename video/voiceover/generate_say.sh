#!/usr/bin/env bash
# Voiceover через macOS `say` (Milena, ru_RU) — без ElevenLabs API.
# Качество хуже, но работает out-of-the-box и бесплатно.
#
# Запуск: bash video/voiceover/generate_say.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
OUT="$ROOT/out"
mkdir -p "$OUT"

VOICE="${VOICE:-Milena}"   # ru_RU, женский. Альтернативы: Yuri (если есть)
RATE="${RATE:-200}"         # слов/мин (140-220 нормально)

declare -a SEGMENTS=(
  "01_hook|Только пять процентов звонков проверяете вручную. Остальные девяносто пять процентов — слепая зона."
  "02_solution|SpeechLyt анализирует сто процентов звонков. Whisper. Эмоции. Скрипты."
  "03_calls_list|Все звонки в одном месте. С транскрипцией и метриками."
  "04_call_detail|Полная транскрипция, эмоции по таймлайну, нарушения скрипта."
  "05_qa_dashboard|Авто-Кью-Эй: AI заполняет восемьдесят процентов полей. Супервайзер только утверждает."
  "06_pricing|От девятисот девяноста белорусских рублей в месяц. Гарантия плюс пятнадцать процентов качества за девяносто дней или возврат."
  "07_cta|Аудит за тысячу пятьсот белорусских рублей. Семь дней. Сегодня."
)

echo "[say] Voice: $VOICE, Rate: $RATE wpm"
echo ""

# Generate per-segment AIFF then convert to MP3
for entry in "${SEGMENTS[@]}"; do
  id="${entry%%|*}"
  text="${entry#*|}"
  aiff="$OUT/${id}.aiff"
  mp3="$OUT/${id}.mp3"

  echo "[say] $id → $mp3"
  say -v "$VOICE" -r "$RATE" -o "$aiff" "$text"
  ffmpeg -y -loglevel error -i "$aiff" -codec:a libmp3lame -qscale:a 2 "$mp3"
  rm -f "$aiff"
done

# Concatenate all into hero_voiceover.mp3 with timed gaps to match segments.json
echo ""
echo "[say] Сборка voiceover_full.mp3 с таймингом сегментов…"

CONCAT="$OUT/concat.txt"
> "$CONCAT"

# Each segment placed at its start_sec, padded with silence to next one
SEGMENTS_JSON="$OUT/segments.json"
if [[ ! -f "$SEGMENTS_JSON" ]]; then
  echo "[say] ⚠ segments.json не найден — собираю просто конкатом."
  for entry in "${SEGMENTS[@]}"; do
    id="${entry%%|*}"
    echo "file '${id}.mp3'" >> "$CONCAT"
  done
else
  # Use python to read segments.json and emit silent gaps between MP3s
  python3 - <<EOF >> "$CONCAT"
import json, subprocess
with open("$SEGMENTS_JSON") as f:
    timeline = json.load(f)
segs = timeline["segments"]
prev_end = 0.0
for s in segs:
    start = float(s["start_sec"])
    gap = start - prev_end
    if gap > 0.05:
        # Emit silent MP3 of `gap` seconds
        silent = f"silent_{int(start*100)}.mp3"
        subprocess.check_call([
            "ffmpeg", "-y", "-loglevel", "error",
            "-f", "lavfi", "-i", f"anullsrc=r=22050:cl=mono",
            "-t", str(gap), "-codec:a", "libmp3lame", "-qscale:a", "5",
            f"$OUT/{silent}"
        ])
        print(f"file '{silent}'")
    print(f"file '{s['id']}.mp3'")
    # Get duration of just-said segment to update prev_end
    out = subprocess.check_output([
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1",
        f"$OUT/{s['id']}.mp3"
    ]).decode().strip()
    prev_end = start + float(out)
EOF
fi

ffmpeg -y -loglevel error -f concat -safe 0 -i "$CONCAT" -c copy "$OUT/voiceover_full.mp3"

# Cleanup intermediate silents
rm -f "$OUT"/silent_*.mp3 "$CONCAT"

DUR=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$OUT/voiceover_full.mp3")
echo ""
echo "[say] ✓ Готово: $OUT/voiceover_full.mp3 ($(printf '%.1f' "$DUR")s)"
