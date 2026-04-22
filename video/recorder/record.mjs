#!/usr/bin/env node
/**
 * SpeechLyt screencast recorder.
 * Адаптировано из tender-ai/video/recorder/record.mjs.
 *
 * Phase 1 (frontend :3000): тур реального кабинета — dashboard → calls → call detail → qa
 * Phase 2 (landing :3000 та же страница, скролл): Hero → Cases → Guarantee → Pricing → CTA
 *
 * Перед запуском:
 *   1. cd frontend && npm run dev    (на :3000)
 *   2. Должны быть тестовые данные (несколько звонков, оценок)
 *   3. Логин — нужен auto-bypass или сохранённая сессия
 *
 * Запуск:
 *   cd video/recorder && npm install && npx playwright install chromium && node record.mjs
 *
 * Результат: video/out/screencast/<random>.webm → конвертить в MP4 через ffmpeg.
 */

import { chromium } from "playwright";
import { mkdirSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, "../out/screencast");
mkdirSync(OUT_DIR, { recursive: true });

const SEGMENTS_FILE = resolve(__dirname, "../voiceover/out/segments.json");
const timeline = JSON.parse(readFileSync(SEGMENTS_FILE, "utf-8"));
const segById = Object.fromEntries(timeline.segments.map((s) => [s.id, s]));

// Frontend dev server URL — поменяй если другой порт
const APP_URL = process.env.SPEECHLYT_APP_URL || "http://localhost:3000";
const VIEWPORT = { width: 1920, height: 1080 };

// Цвет курсора — наш бренд (blue) вместо tender'овского gold
const CURSOR_COLOR = "59,130,246"; // tailwind blue-500
const CURSOR_BORDER = "#3B82F6";

// Demo-mode query param to bypass auth in frontend
const DEMO = "?demo=1";

// Inject fake-cursor + caption + fade-overlay поверх любой страницы
const OVERLAY_JS = `
(() => {
  if (document.querySelector('.__fake-cursor')) return;

  const cursor = document.createElement('div');
  cursor.className = '__fake-cursor';
  Object.assign(cursor.style, {
    position: 'fixed', top: '50%', left: '50%',
    width: '26px', height: '26px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(${CURSOR_COLOR},0.95) 0%, rgba(${CURSOR_COLOR},0.4) 55%, transparent 100%)',
    border: '2px solid ${CURSOR_BORDER}', pointerEvents: 'none', zIndex: '99999',
    transform: 'translate(-50%, -50%)',
    boxShadow: '0 0 24px rgba(${CURSOR_COLOR},0.75), 0 0 8px rgba(${CURSOR_COLOR},0.9)',
    transition: 'left 0.06s linear, top 0.06s linear'
  });
  document.documentElement.appendChild(cursor);

  const ring = document.createElement('div');
  ring.className = '__fake-cursor-ring';
  Object.assign(ring.style, {
    position: 'fixed', top: '50%', left: '50%',
    width: '44px', height: '44px', borderRadius: '50%',
    border: '1.5px solid rgba(${CURSOR_COLOR},0.5)',
    pointerEvents: 'none', zIndex: '99998',
    transform: 'translate(-50%, -50%)',
    transition: 'left 0.12s cubic-bezier(0.25,0.46,0.45,0.94), top 0.12s cubic-bezier(0.25,0.46,0.45,0.94)',
    animation: '__ring-pulse 1.6s ease-in-out infinite'
  });
  document.documentElement.appendChild(ring);

  const caption = document.createElement('div');
  caption.className = '__caption';
  Object.assign(caption.style, {
    position: 'fixed', bottom: '48px', left: '50%',
    padding: '16px 32px', borderRadius: '20px',
    fontFamily: 'Inter, -apple-system, system-ui, sans-serif',
    fontSize: '22px', fontWeight: '600', color: 'white',
    background: 'rgba(15,23,42,0.92)',
    backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(${CURSOR_COLOR},0.45)',
    boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(${CURSOR_COLOR},0.15)',
    opacity: '0',
    transform: 'translate(-50%, 24px)',
    transition: 'opacity 0.45s cubic-bezier(0.22,1,0.36,1), transform 0.45s cubic-bezier(0.22,1,0.36,1)',
    zIndex: '99997', pointerEvents: 'none',
    maxWidth: '85vw', textAlign: 'center', whiteSpace: 'nowrap',
    textShadow: '0 2px 12px rgba(0,0,0,0.6)'
  });
  document.documentElement.appendChild(caption);

  // Fade-overlay для smooth transitions между страницами
  const fade = document.createElement('div');
  fade.className = '__fade';
  Object.assign(fade.style, {
    position: 'fixed', inset: '0', background: '#0a0a0f',
    opacity: '0', pointerEvents: 'none', zIndex: '99996',
    transition: 'opacity 0.45s cubic-bezier(0.4,0,0.2,1)'
  });
  document.documentElement.appendChild(fade);
  window.__fadeOut = () => { fade.style.opacity = '1'; };
  window.__fadeIn = () => { fade.style.opacity = '0'; };

  const style = document.createElement('style');
  style.textContent = '@keyframes __ring-pulse{0%,100%{opacity:0.7;transform:translate(-50%,-50%) scale(1)}50%{opacity:0.2;transform:translate(-50%,-50%) scale(1.4)}}';
  document.head.appendChild(style);

  document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
    ring.style.left = e.clientX + 'px';
    ring.style.top = e.clientY + 'px';
  }, { capture: true, passive: true });

  window.__showCaption = (text) => {
    caption.textContent = text;
    caption.style.opacity = '1';
    caption.style.transform = 'translate(-50%, 0)';
  };
  window.__hideCaption = () => {
    caption.style.opacity = '0';
    caption.style.transform = 'translate(-50%, 24px)';
  };
  window.__setCursorPos = (x, y) => {
    cursor.style.left = x + 'px';
    cursor.style.top = y + 'px';
    ring.style.left = x + 'px';
    ring.style.top = y + 'px';
  };
})();
`;

async function injectOverlay(page, cursor) {
  await page.evaluate(OVERLAY_JS);
  if (cursor) await page.evaluate((p) => window.__setCursorPos(p.x, p.y), cursor);
}
async function fadeOut(page) {
  await page.evaluate(() => window.__fadeOut && window.__fadeOut());
  await page.waitForTimeout(450);
}
async function fadeIn(page) {
  await page.evaluate(() => window.__fadeIn && window.__fadeIn());
  await page.waitForTimeout(450);
}
async function navigate(page, path) {
  await fadeOut(page);
  await page.goto(`${APP_URL}${path}${path.includes("?") ? "&" : "?"}demo=1`, {
    waitUntil: "networkidle",
  });
  await injectOverlay(page);
  await fadeIn(page);
}
async function showCaption(page, text) {
  await page.evaluate((t) => window.__showCaption && window.__showCaption(t), text);
}
async function hideCaption(page) {
  await page.evaluate(() => window.__hideCaption && window.__hideCaption());
}
async function smoothMove(page, from, to, steps = 28, stepDelay = 12) {
  if (!to) return;
  const dx = (to.x - from.x) / steps;
  const dy = (to.y - from.y) / steps;
  for (let i = 1; i <= steps; i++) {
    await page.mouse.move(from.x + dx * i, from.y + dy * i);
    await page.waitForTimeout(stepDelay);
  }
}
async function hoverAt(page, selector) {
  try {
    const el = await page
      .locator(selector)
      .first()
      .boundingBox({ timeout: 2000 });
    if (!el) return null;
    return { x: el.x + el.width / 2, y: el.y + el.height / 2 };
  } catch {
    return null;
  }
}
const wait = (page, ms) => page.waitForTimeout(ms);
async function waitUntil(startedAt, targetSec, page) {
  const remaining = targetSec * 1000 - (Date.now() - startedAt);
  if (remaining > 0) await page.waitForTimeout(remaining);
}
async function scrollTo(page, locatorStr, offset = -80) {
  try {
    const box = await page
      .locator(locatorStr)
      .first()
      .boundingBox({ timeout: 2000 });
    if (!box) return;
    await page.evaluate(
      ({ y, off }) => {
        const target = y + window.scrollY + off;
        window.scrollTo({ top: target, behavior: "smooth" });
      },
      { y: box.y, off: offset }
    );
  } catch (e) {
    console.log(`scroll failed for "${locatorStr}": ${e.message}`);
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 2,
    recordVideo: { dir: OUT_DIR, size: VIEWPORT },
  });

  // Force "Дана Холдинг" project before any page loads — the frontend
  // reads localStorage["speechlyt-project-id"] in api.ts interceptor and
  // sends it as X-Project-Id header. Без этого UI открывается на пустом
  // Default-проекте и таблицы пустые.
  const DANA_PROJECT_ID = "00000000-0000-0000-0000-000000000002";
  await context.addInitScript((projectId) => {
    try {
      localStorage.setItem("speechlyt-project-id", projectId);
    } catch {}
  }, DANA_PROJECT_ID);

  const page = await context.newPage();

  let cursor = { x: VIEWPORT.width / 2, y: VIEWPORT.height / 2 };
  const move = async (to) => {
    if (!to) return;
    await smoothMove(page, cursor, to);
    cursor = to;
  };

  // ═════════ PHASE 1: dashboard / kabinet ═════════
  await page.goto(`${APP_URL}/dashboard${DEMO}`, { waitUntil: "networkidle" });
  await injectOverlay(page, cursor);
  await wait(page, 300);

  const t0 = Date.now();

  // Helper: 1 hover на сегмент с ранним выходом, потом ждём до end_sec
  const hoverFirst = async (selectors) => {
    for (const sel of selectors) {
      const t = await hoverAt(page, sel);
      if (t) {
        await move(t);
        return true;
      }
    }
    return false;
  };

  // SEG 1 — HOOK (dashboard, тревожная метрика)
  console.log("[1/7] hook");
  await showCaption(page, segById["01_hook"].caption);
  await hoverFirst([
    "text=/AHT/i",
    "text=/критические/i",
    "text=/необработ/i",
    "text=/требует внимания/i",
  ]);
  await waitUntil(t0, segById["01_hook"].end_sec, page);
  await hideCaption(page);

  // SEG 2 — SOLUTION (KPI tour)
  console.log("[2/7] solution");
  await showCaption(page, segById["02_solution"].caption);
  await hoverFirst([
    "text=/CSAT/i",
    "text=/конверс/i",
    "text=/качеств/i",
    "text=/100/i",
  ]);
  await waitUntil(t0, segById["02_solution"].end_sec, page);
  await hideCaption(page);

  // SEG 3 — CALLS LIST
  console.log("[3/7] calls list");
  await navigate(page, "/calls");
  await showCaption(page, segById["03_calls_list"].caption);
  await hoverFirst(["tbody tr:nth-child(2)", "tbody tr:first-child"]);
  await waitUntil(t0, segById["03_calls_list"].end_sec, page);
  await hideCaption(page);

  // SEG 4 — CALL DETAIL
  console.log("[4/7] call detail");
  let opened = false;
  for (const sel of [
    "tbody tr:first-child a",
    "tbody tr:first-child",
    'a[href*="/calls/"]',
  ]) {
    try {
      await page.locator(sel).first().click({ timeout: 1500 });
      opened = true;
      break;
    } catch {}
  }
  if (opened) {
    await page.waitForLoadState("networkidle");
    await injectOverlay(page, cursor);
  }
  await showCaption(page, segById["04_call_detail"].caption);
  await hoverFirst([
    "text=/транскрипц/i",
    "text=/эмоци/i",
    "text=/скрипт/i",
  ]);
  await waitUntil(t0, segById["04_call_detail"].end_sec, page);
  await hideCaption(page);

  // SEG 5 — QA DASHBOARD
  console.log("[5/7] qa");
  await navigate(page, "/qa");
  await showCaption(page, segById["05_qa_dashboard"].caption);
  await hoverFirst([
    "text=/чек-лист/i",
    "text=/auto/i",
    "text=/AI/i",
    "tbody tr:first-child",
  ]);
  await waitUntil(t0, segById["05_qa_dashboard"].end_sec, page);
  await hideCaption(page);

  // ═════════ PHASE 2: landing ═════════
  // SEG 6 — PRICING
  console.log("[6/7] pricing");
  await navigate(page, "/#pricing");
  await scrollTo(page, "#pricing", -40);
  await showCaption(page, segById["06_pricing"].caption);
  await hoverFirst([
    "text=/Growth/i",
    "text=/Гарантия 90/i",
    "text=/2 490/i",
    "text=/990/i",
  ]);
  await waitUntil(t0, segById["06_pricing"].end_sec, page);
  await hideCaption(page);

  // SEG 7 — CTA
  console.log("[7/7] cta");
  await navigate(page, "/#cta");
  await scrollTo(page, "#cta", -40);
  await showCaption(page, segById["07_cta"].caption);
  await hoverFirst([
    "text=/Заказать аудит/i",
    "text=/1 500 BYN/i",
  ]);
  await waitUntil(t0, segById["07_cta"].end_sec, page);
  await hideCaption(page);
  await wait(page, 300);

  await context.close();
  await browser.close();

  const totalElapsed = (Date.now() - t0) / 1000;
  console.log(`\n✓ Записано ${totalElapsed.toFixed(1)}s (цель ${timeline.total_sec}s)`);
  console.log(`✓ WebM лежит в ${OUT_DIR}`);
  console.log(``);
  console.log(`Дальше:`);
  console.log(`  ffmpeg -i ${OUT_DIR}/*.webm \\`);
  console.log(`    -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p \\`);
  console.log(`    ../out/screencast.mp4`);
  console.log(``);
  console.log(`И копируйте на лендинг:`);
  console.log(`  cp video/out/screencast.mp4 frontend/public/video/hero_60s.mp4`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
