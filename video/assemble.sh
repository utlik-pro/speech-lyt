#!/usr/bin/env bash
# Сборка финального hero_60s.mp4 из Seedance клипов + voiceover + музыки
# Запуск: bash video/assemble.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
CLIPS="$ROOT/clips"
OUT="$ROOT/out"
mkdir -p "$OUT"

cd "$ROOT"

# 1. Concat clips
echo "[assemble] Объединяю Seedance клипы…"
{
  for clip in scene_1_silent_office scene_2_lost_money scene_3_speechlyt_appears scene_4_features_tour scene_5_proof_clients scene_6_cta_offer; do
    echo "file 'clips/$clip.mp4'"
  done
} > "$OUT/concat.txt"

ffmpeg -y -f concat -safe 0 -i "$OUT/concat.txt" -c copy "$OUT/video_concat.mp4"

# 2. Mix voiceover + music (если есть)
VO="$ROOT/voiceover/hero_voiceover.mp3"
BGM="$ROOT/music/bgm.mp3"

if [[ -f "$VO" && -f "$BGM" ]]; then
  echo "[assemble] Микширую голос (-3dB) + BGM (-18dB)…"
  ffmpeg -y -i "$VO" -i "$BGM" \
    -filter_complex "[0:a]volume=0.7[vo];[1:a]volume=0.13[bg];[vo][bg]amix=inputs=2:duration=longest" \
    "$OUT/audio_final.mp3"
elif [[ -f "$VO" ]]; then
  echo "[assemble] Только голос (BGM не найден)…"
  cp "$VO" "$OUT/audio_final.mp3"
else
  echo "[assemble] ⚠ Нет $VO — финальное видео будет без звука."
  cp "$OUT/video_concat.mp4" "$OUT/hero_final.mp4"
  echo "[assemble] Готово: $OUT/hero_final.mp4 (без звука)"
  echo "[assemble] Скопируйте: cp $OUT/hero_final.mp4 frontend/public/video/hero_60s.mp4"
  exit 0
fi

# 3. Mux video + audio
echo "[assemble] Финальный mux…"
ffmpeg -y -i "$OUT/video_concat.mp4" -i "$OUT/audio_final.mp3" \
  -c:v copy -c:a aac -b:a 192k -shortest \
  "$OUT/hero_final.mp4"

echo "[assemble] ✓ Готово: $OUT/hero_final.mp4"
echo "[assemble] Размер: $(du -h "$OUT/hero_final.mp4" | cut -f1)"
echo ""
echo "Скопируйте на лендинг:"
echo "  cp $OUT/hero_final.mp4 frontend/public/video/hero_60s.mp4"
