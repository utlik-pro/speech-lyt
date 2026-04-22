# Playwright-скринкаст реального кабинета SpeechLyt

Автоматическая запись 60-секундного скринкаста реального кабинета +
лендинга для hero-видео. Адаптировано из `tender-ai/video/recorder/`.

## Что внутри ролика (7 сегментов, 60 сек)

| # | Сегмент | Сцена | Caption |
|---|---|---|---|
| 1 | hook | Dashboard | «Только 5 % звонков проверяете вручную...» |
| 2 | solution | Dashboard / KPI | «SpeechLyt анализирует 100 % звонков...» |
| 3 | calls_list | /calls | «Все звонки в одном месте...» |
| 4 | call_detail | /calls/[id] | «Транскрипция, эмоции, нарушения скрипта» |
| 5 | qa_dashboard | /qa | «Авто-QA: AI заполняет 80 % полей» |
| 6 | pricing | / #pricing | «От 990 BYN. Гарантия +15 %...» |
| 7 | cta | / #cta | «Аудит за 1 500 BYN. 7 дней. Сегодня.» |

## Что отрисовывается поверх

- **Голубой fake-cursor** (наш бренд, brand blue `#3B82F6`) с pulse-ring
- **Smooth движения** между элементами (28 шагов, плавно)
- **Caption-overlay** внизу экрана, синхронизирован с сегментами

## Запуск

### 1. Поднять frontend dev-сервер

```bash
cd frontend
npm run dev
# открывает на http://localhost:3000
```

⚠️ **Важно**: для красивого скринкаста нужны:
- Тестовый пользователь, авто-логиненный (или сохранённая сессия в playwright)
- Несколько демо-звонков с транскрипциями, эмоциями
- Несколько QA-оценок

### 2. Установить и запустить рекордер

```bash
cd video/recorder
npm install
npx playwright install chromium

# Записать (frontend должен быть запущен на :3000)
node record.mjs
```

Опционально — задать другой URL:
```bash
SPEECHLYT_APP_URL=http://localhost:3001 node record.mjs
```

**Результат:** `video/out/screencast/<random>.webm` — видео 1920×1080.

### 3. Конвертация WebM → MP4

```bash
ffmpeg -i video/out/screencast/*.webm \
  -c:v libx264 -preset slow -crf 18 \
  -pix_fmt yuv420p \
  video/out/screencast.mp4
```

### 4. Подмешать voiceover (опционально)

Если у вас уже есть `video/voiceover/hero_voiceover.mp3` (от ElevenLabs
по сценарию `video/voiceover_script.md`):

```bash
ffmpeg -y -i video/out/screencast.mp4 -i video/voiceover/hero_voiceover.mp3 \
  -c:v copy -c:a aac -b:a 192k -shortest \
  video/out/hero_final.mp4
```

### 5. Положить на лендинг

```bash
cp video/out/screencast.mp4 frontend/public/video/hero_60s.mp4
git add frontend/public/video/hero_60s.mp4
git commit -m "feat: replace placeholder with real SpeechLyt screencast"
git push origin master
cd frontend && npx vercel --prod --yes
```

## Подгонка тайминга

Если запись слишком короткая/длинная — отредактируй
`video/voiceover/out/segments.json`:

- `start_sec` / `end_sec` — определяют, сколько на каждом сегменте задержаться
- `caption` — текст внизу экрана
- `total_sec` — общая длительность ролика

## Подгонка селекторов

Скрипт ищет элементы по тексту/role в каждом сегменте — если у вас в кабинете
другие надписи (например «Calls» вместо «Звонки»), правь селекторы в
`record.mjs` в массивах `for (const sel of [...])`.

## Альтернатива: Seedance-генерация

Если не хочется записывать реальный кабинет — есть параллельный pipeline
через Seedance 2.0 (cinematic AI-видео): см. `video/README.md` и
`video/seedance_prompts.md`.
