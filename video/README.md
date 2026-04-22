# Видео для speech.utlik.co

Hero-ролик 60 сек. Два параллельных подхода (как у `tender-ai/video/`):

## A. Скринкаст реального кабинета — **рекомендуемый** (как у тендеров)

📁 **`recorder/`** — Playwright headless chromium записывает прохождение
по реальному dev-кабинету `frontend` (dashboard → calls → call detail →
qa → лендинг pricing → CTA), с инжектированным синим fake-cursor и
caption-overlay'ями, синхронизированными с voiceover-сегментами.

Это **то же самое что у тендеров** — там видео в Hero собрано именно
скринкастом реального dev-приложения, а не AI-генерацией.

См. `recorder/README.md` для запуска.

## B. Seedance 2.0 (cinematic AI-генерация)

Альтернативный путь если нет работающего dev-кабинета или хочется
cinematic-постановку с реальными «офисными» сценами.

## Файлы

- `seedance_prompts.md` — детальные промпты с раскадровкой по сценам
- `prompts.json` — машиночитаемая версия для скрипта генерации
- `voiceover_script.md` — текст закадрового голоса на русском (RU)
- `generate_seedance.py` — генератор клипов через AtlasCloud API
- `assemble.sh` — сборка финального MP4 через ffmpeg

## Текущее состояние

✅ Заглушка `frontend/public/video/hero_60s.mp4` (заимствована у tender-ai как placeholder)
⏳ Нужно сгенерировать собственный ролик про SpeechLyt — см. инструкции ниже

## Как запустить генерацию

API-ключ AtlasCloud (тот же, что для Nano Banana 2 и tender-ai):

```bash
# Все сцены, Seedance 2.0 Fast (-20% от Pro, $0.101/sec)
ATLAS_API_KEY=... python3.11 video/generate_seedance.py --fast

# Pro-качество для финала
ATLAS_API_KEY=... python3.11 video/generate_seedance.py
```

Результаты попадут в `video/clips/`.

## Цены AtlasCloud (актуальные на апрель 2026)

| Модель | Цена/сек | Рекомендация |
|---|---|---|
| Seedance 2.0 Pro | $0.127 | Финальный рендер |
| **Seedance 2.0 Fast** | **$0.101** | Черновики и тесты (-20%) |
| Wan 2.7 (Alibaba) | $0.10 | Дешевле, качество ниже |
| Veo 3.1 | $0.20 | Эталон |
| Wan 2.2-turbo | $0.02 | Только для соц. сетей |

## Расчёт на полный ролик SpeechLyt

6 сцен в `prompts.json` ≈ 51 секунда:
- Seedance 2.0 Pro: **$6.48** (≈ 18 BYN)
- Seedance 2.0 Fast: **$5.15** (≈ 14 BYN)

## Pipeline шаги

1. **Seedance клипы** (6 шт) → `clips/` через AtlasCloud
2. **Remotion-сцены** (Dashboard анимация + Pricing reveal) — `remotion/`
3. **Озвучка ElevenLabs** по `voiceover_script.md` (~$0.04 на русский)
4. **Royalty-free музыка** — Artlist / Epidemic Sound (cinematic tech)
5. **Сборка ffmpeg** — `assemble.sh`
6. **Финал** → `frontend/public/video/hero_60s.mp4` (заменяет placeholder)

## Чек-лист релиза

- [ ] 6 Seedance клипов сгенерированы
- [ ] 2 Remotion композиции (Dashboard + Pricing) отрендерены
- [ ] ElevenLabs озвучка нарезана по сегментам
- [ ] Royalty-free музыка подобрана
- [ ] ffmpeg собрал MP4 (1080p, h264, aac)
- [ ] Версии: 60 сек hero + 30 сек cut для соц.сетей
- [ ] Субтитры .srt сгенерированы (Whisper)
- [ ] Файл скопирован в `frontend/public/video/hero_60s.mp4`
- [ ] git commit + vercel --prod deploy

## Альтернативы AtlasCloud

1. **Replicate** — `bytedance/seedance-1-pro` (только 1.0), $0.05/сек.
2. **Fal.ai** — быстрый, но дороже.
3. **Volcengine** (ByteDance напрямую) — самый низкий latency, нужна регистрация в Китае.
