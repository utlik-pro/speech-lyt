#!/usr/bin/env python3.11
"""
Генерация Seedance клипов для SpeechLyt hero-видео через AtlasCloud API.

Адаптировано из tender-ai/video/generate_seedance.py.

Usage:
    ATLAS_API_KEY=... python3.11 video/generate_seedance.py [--fast] [--scene-id <id>]

Стоимость:
    Seedance 2.0 Fast: $0.101/sec → весь ролик ~$5.66
    Seedance 2.0 Pro:  $0.127/sec → весь ролик ~$7.11
"""

import argparse
import json
import os
import sys
import time
from pathlib import Path
from typing import Any

import urllib.request
import urllib.error

ROOT = Path(__file__).parent
PROMPTS_FILE = ROOT / "prompts.json"
CLIPS_DIR = ROOT / "clips"
ATLAS_BASE = "https://api.atlascloud.ai/v1"


def log(msg: str) -> None:
    print(f"[seedance] {msg}", flush=True)


def post(url: str, payload: dict[str, Any], headers: dict[str, str]) -> dict[str, Any]:
    data = json.dumps(payload).encode()
    req = urllib.request.Request(url, data=data, headers={**headers, "Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=300) as resp:
        return json.loads(resp.read().decode())


def get(url: str, headers: dict[str, str]) -> dict[str, Any]:
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.loads(resp.read().decode())


def download(url: str, path: Path) -> None:
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req, timeout=300) as resp, path.open("wb") as f:
        while chunk := resp.read(64 * 1024):
            f.write(chunk)


def generate_scene(scene: dict[str, Any], model: str, api_key: str) -> Path | None:
    sid = scene["id"]
    duration = scene["duration_sec"]
    out_path = CLIPS_DIR / f"{sid}.mp4"

    if out_path.exists():
        log(f"  ✓ {sid} уже есть, пропускаю ({out_path})")
        return out_path

    log(f"  → {sid} ({duration}s, {model})")

    headers = {"Authorization": f"Bearer {api_key}"}
    payload = {
        "model": model,
        "prompt": scene["prompt"],
        "negative_prompt": scene.get("negative_prompt", ""),
        "duration": duration,
        "resolution": "1920x1080",
        "fps": 24,
    }

    try:
        resp = post(f"{ATLAS_BASE}/video/generations", payload, headers)
    except urllib.error.HTTPError as e:
        body = e.read().decode(errors="replace")
        log(f"  ✗ {sid}: HTTP {e.code} — {body[:300]}")
        return None
    except Exception as e:
        log(f"  ✗ {sid}: {type(e).__name__} — {e}")
        return None

    job_id = resp.get("id") or resp.get("job_id")
    if not job_id:
        log(f"  ✗ {sid}: нет job_id в ответе: {resp}")
        return None

    # Poll
    for attempt in range(120):
        time.sleep(5)
        try:
            status = get(f"{ATLAS_BASE}/video/generations/{job_id}", headers)
        except Exception as e:
            log(f"  ⏳ {sid}: poll error {e}, продолжаю…")
            continue

        state = status.get("status", "unknown")
        if state in ("succeeded", "completed", "done"):
            video_url = status.get("video_url") or status.get("output", {}).get("video_url")
            if not video_url:
                log(f"  ✗ {sid}: нет video_url: {status}")
                return None
            log(f"  ↓ {sid}: скачиваю…")
            download(video_url, out_path)
            log(f"  ✓ {sid}: готово → {out_path}")
            return out_path
        if state in ("failed", "error"):
            log(f"  ✗ {sid}: failed — {status.get('error', '?')}")
            return None
        if attempt % 6 == 0:
            log(f"  ⏳ {sid}: {state} ({attempt * 5}s)")

    log(f"  ✗ {sid}: таймаут (10 мин)")
    return None


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--fast", action="store_true", help="Seedance 2.0 Fast (-20% от Pro)")
    parser.add_argument("--scene-id", help="Сгенерировать только одну сцену по id")
    args = parser.parse_args()

    api_key = os.environ.get("ATLAS_API_KEY")
    if not api_key:
        log("ATLAS_API_KEY не задан в env. Прерываю.")
        return 1

    model = "seedance-2.0-fast" if args.fast else "seedance-2.0-pro"
    CLIPS_DIR.mkdir(parents=True, exist_ok=True)

    config = json.loads(PROMPTS_FILE.read_text())
    scenes = config["scenes"]
    if args.scene_id:
        scenes = [s for s in scenes if s["id"] == args.scene_id]
        if not scenes:
            log(f"Сцена {args.scene_id} не найдена в prompts.json")
            return 1

    total_sec = sum(s["duration_sec"] for s in scenes)
    rate = 0.101 if args.fast else 0.127
    log(f"Сцен: {len(scenes)}, общий хронометраж: {total_sec}s")
    log(f"Модель: {model}, ориентировочная стоимость: ${total_sec * rate:.2f}")
    log("")

    results = []
    for scene in scenes:
        results.append(generate_scene(scene, model, api_key))

    ok = sum(1 for r in results if r)
    log("")
    log(f"Итог: {ok}/{len(results)} сцен сгенерировано в {CLIPS_DIR}")
    log("Дальше: ffmpeg-сборка через assemble.sh")
    return 0 if ok == len(results) else 2


if __name__ == "__main__":
    sys.exit(main())
