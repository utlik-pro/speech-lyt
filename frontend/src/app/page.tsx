"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Headphones,
  BarChart3,
  Phone,
  Shield,
  Users,
  Bell,
  FileText,
  Mic,
  TrendingUp,
  Zap,
  Globe,
  Webhook,
  KeyRound,
  ArrowRight,
  CheckCircle2,
  ChevronUp,
  Server,
  Lock,
  Languages,
  Rocket,
  Check,
  Award,
  Clock,
  X,
  Gift,
  Flame,
  Building2,
  Quote,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import MockDashboard from "@/components/landing/mock-dashboard";
import MockCalls from "@/components/landing/mock-calls";
import MockQA from "@/components/landing/mock-qa";
import { HeroVideo } from "@/components/landing/hero-video";

/* ------------------------------------------------------------------ */
/*  Landing Header                                                     */
/* ------------------------------------------------------------------ */
function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "border-b border-zinc-200 bg-white/95 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2.5">
          <Headphones className={`h-6 w-6 ${scrolled ? "text-blue-600" : "text-blue-400"}`} />
          <span className={`text-lg font-bold transition-colors ${scrolled ? "text-zinc-900 dark:text-white" : "text-white"}`}>
            SpeechLyt
          </span>
        </div>

        <nav className="hidden items-center gap-6 text-sm md:flex">
          {[
            { href: "#offer", label: "Что входит" },
            { href: "#cases", label: "Кейсы" },
            { href: "#guarantee", label: "Гарантия" },
            { href: "#pricing", label: "Тарифы" },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`transition-colors ${
                scrolled
                  ? "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                  : "text-zinc-300 hover:text-white"
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            className={scrolled ? "" : "text-zinc-300 hover:text-white hover:bg-white/10"}
            asChild
          >
            <Link href="/login">Войти</Link>
          </Button>
          <Button
            className={scrolled ? "" : "bg-white text-zinc-900 hover:bg-zinc-100"}
            asChild
          >
            <a href="#cta">Заказать аудит</a>
          </Button>
        </div>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero — Magnetic Formula                                            */
/* ------------------------------------------------------------------ */
function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 pb-20 pt-32">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2">
        <div className="h-[600px] w-[800px] rounded-full bg-blue-600/10 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          {/* Urgency badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-sm text-amber-300">
            <Flame className="h-3.5 w-3.5" />
            Цены v1.0 до 1 июня 2026 — далее setup fee удваивается
          </div>

          <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight text-white md:text-5xl lg:text-6xl">
            100 % звонков{" "}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              под контролем
            </span>
            <br />
            за 1 день. Гарантия +15 %{" "}
            <br className="hidden md:block" />
            качества за 90 дней.
          </h1>

          <p className="mb-8 text-lg leading-relaxed text-zinc-400 md:text-xl">
            Платформа речевой аналитики на собственном контуре. Без OpenAI,
            без миллионных бюджетов, оплата в BYN с резидентом ПВТ.{" "}
            <strong className="text-white">
              Если не вырастем на +15 % за 90 дней — вернём 100 % подписки.
            </strong>
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="gap-2 bg-blue-600 text-white hover:bg-blue-700" asChild>
              <a href="#cta">
                Заказать аудит за 1 500 BYN
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
            <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10" asChild>
              <a href="#offer">Что входит в платформу</a>
            </Button>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-zinc-500">
            <span className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-blue-400" /> 7 дней до отчёта
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-blue-400" /> Гарантия возврата
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-blue-400" /> Дана Холдинг + банки/телеком/страхование
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-blue-400" /> ОАЦ-комплаенс
            </span>
          </div>
        </div>

        <div className="relative mx-auto mt-16 max-w-4xl">
          <div className="absolute -inset-4 rounded-2xl bg-gradient-to-r from-blue-600/20 via-cyan-500/20 to-blue-600/20 blur-xl" />
          <div className="relative">
            <HeroVideo src="/video/hero_60s.mp4" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Before / After — кричащее сравнение                                */
/* ------------------------------------------------------------------ */
function BeforeAfterSection() {
  const rows = [
    {
      label: "Покрытие звонков аудитом",
      before: "5 % (ручная выборка)",
      after: "100 % (AI на каждом звонке)",
    },
    {
      label: "Время супервайзера на QA",
      before: "60–70 % рабочего времени",
      after: "10–15 % (только утверждение)",
    },
    {
      label: "Скрипт-нарушения находятся",
      before: "через дни / недели",
      after: "в реальном времени",
    },
    {
      label: "Стоимость 1 проверки звонка",
      before: "≈ 2 BYN (ручной QA)",
      after: "≈ 0,05 BYN (AI)",
    },
    {
      label: "Решения по обучению операторов",
      before: "субъективные мнения",
      after: "data-driven рекомендации AI-коуча",
    },
    {
      label: "Зависимость от OpenAI / Anthropic",
      before: "блокировка платежей в РБ",
      after: "локальные LLM в вашем контуре",
    },
  ];

  return (
    <section className="bg-gradient-to-b from-zinc-900 to-zinc-950 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            Что вы получите{" "}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              на следующий день
            </span>{" "}
            после внедрения
          </h2>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10">
          {/* Header */}
          <div className="grid grid-cols-1 gap-px bg-white/10 md:grid-cols-3">
            <div className="bg-zinc-900 p-4 text-sm font-semibold text-zinc-400">
              Метрика
            </div>
            <div className="bg-red-500/5 p-4 text-sm font-semibold text-red-300">
              <span className="inline-flex items-center gap-2">
                <X className="h-4 w-4" /> Без SpeechLyt
              </span>
            </div>
            <div className="bg-emerald-500/5 p-4 text-sm font-semibold text-emerald-300">
              <span className="inline-flex items-center gap-2">
                <Check className="h-4 w-4" /> С SpeechLyt
              </span>
            </div>
          </div>

          {/* Rows */}
          {rows.map((row, idx) => (
            <div
              key={row.label}
              className={`grid grid-cols-1 gap-px bg-white/10 md:grid-cols-3 ${
                idx === rows.length - 1 ? "" : ""
              }`}
            >
              <div className="bg-zinc-900 p-4 text-sm text-white">{row.label}</div>
              <div className="bg-zinc-900/95 p-4 text-sm text-red-200/90">
                {row.before}
              </div>
              <div className="bg-zinc-900/95 p-4 text-sm font-medium text-emerald-200">
                {row.after}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Value Stack — Grand Slam Offer                                     */
/* ------------------------------------------------------------------ */
function ValueStackSection() {
  const core = [
    {
      title: "AI-аналитика 100 % звонков (Whisper RU/BY)",
      value: 25000,
      description: "Транскрипция + диаризация + поиск по всей базе",
    },
    {
      title: "Скрипт-комплаенс с автоконтролем",
      value: 15000,
      description: "Неограниченные чек-листы, автоматическая проверка этапов",
    },
    {
      title: "Авто-QA — AI заполняет 80 % полей",
      value: 12000,
      description: "Экономия 60 % времени супервайзеров",
    },
    {
      title: "Real-time подсказки оператору + AI-коучинг",
      value: 18000,
      description: "Единственная платформа с real-time на белорусском рынке",
    },
    {
      title: "On-prem без OpenAI / Anthropic-зависимости",
      value: 30000,
      description: "Локальные LLM (Llama 3, Qwen 2.5, GigaChat). ПДн не покидают РБ",
    },
    {
      title: "KPI-дашборды + алерты в Telegram",
      value: 8000,
      description: "AHT, FCR, CSAT-прокси, кастомные KPI-формулы",
    },
  ];

  const bonuses = [
    {
      title: "Бонус 1: AI-аудит вашего КЦ за 7 дней",
      value: 5000,
      description: "Письменный отчёт с цитатами нарушений и потенциалом роста в BYN",
    },
    {
      title: "Бонус 2: Onboarding под ключ с интеграцией",
      value: 8000,
      description: "Подключение Asterisk / 3CX / Bitrix24 / amoCRM",
    },
    {
      title: "Бонус 3: 90 дней hyper-care",
      value: 12000,
      description: "Senior CSM на связи + еженедельные ревью KPI",
    },
    {
      title: "Бонус 4: Шаблоны скриптов под отрасль",
      value: 3000,
      description: "Банк, ритейл, медклиника, страхование — готовые сценарии",
    },
    {
      title: "Бонус 5: Доступ в закрытое AI Ops Club",
      value: 2000,
      description: "Сообщество руководителей КЦ РБ — обмен опытом и кейсами",
    },
  ];

  const totalCore = core.reduce((s, x) => s + x.value, 0);
  const totalBonuses = bonuses.reduce((s, x) => s + x.value, 0);
  const total = totalCore + totalBonuses;

  return (
    <section id="offer" className="bg-zinc-950 py-20">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <span className="mb-4 inline-flex rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-400">
            Стек ценности
          </span>
          <h2 className="mt-4 text-3xl font-bold text-white md:text-4xl">
            Что входит в SpeechLyt — посчитайте сами
          </h2>
          <p className="mt-3 text-zinc-400">
            Каждый компонент — цена аналогичного решения на рынке. Сложите —
            и сравните с ценой подписки.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/60">
          {/* Core */}
          <div className="border-b border-white/10 bg-zinc-900 p-6">
            <h3 className="mb-1 text-sm font-semibold uppercase tracking-wider text-blue-400">
              Платформа (включено всегда)
            </h3>
          </div>
          {core.map((item) => (
            <div
              key={item.title}
              className="flex items-start gap-4 border-b border-white/5 p-5"
            >
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-400" />
              <div className="flex-1">
                <div className="font-medium text-white">{item.title}</div>
                <div className="mt-0.5 text-sm text-zinc-400">{item.description}</div>
              </div>
              <div className="shrink-0 text-right font-mono text-sm text-zinc-300">
                {item.value.toLocaleString("ru-BY")} BYN
              </div>
            </div>
          ))}

          {/* Bonuses */}
          <div className="border-b border-t border-white/10 bg-gradient-to-r from-amber-500/10 to-orange-500/5 p-6">
            <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-amber-300">
              <Gift className="h-4 w-4" /> Бонусы при заказе аудита до 1 июня
            </h3>
          </div>
          {bonuses.map((item) => (
            <div
              key={item.title}
              className="flex items-start gap-4 border-b border-white/5 p-5"
            >
              <Gift className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
              <div className="flex-1">
                <div className="font-medium text-white">{item.title}</div>
                <div className="mt-0.5 text-sm text-zinc-400">{item.description}</div>
              </div>
              <div className="shrink-0 text-right font-mono text-sm text-zinc-300">
                {item.value.toLocaleString("ru-BY")} BYN
              </div>
            </div>
          ))}

          {/* Totals */}
          <div className="bg-gradient-to-r from-blue-600/10 to-cyan-500/10 p-6">
            <div className="mb-2 flex items-center justify-between text-sm text-zinc-400">
              <span>Платформа</span>
              <span className="font-mono">{totalCore.toLocaleString("ru-BY")} BYN</span>
            </div>
            <div className="mb-3 flex items-center justify-between text-sm text-amber-300">
              <span>Бонусы</span>
              <span className="font-mono">+{totalBonuses.toLocaleString("ru-BY")} BYN</span>
            </div>
            <div className="mb-4 flex items-center justify-between border-t border-white/10 pt-3 text-base">
              <span className="font-semibold text-white">Итого ценности</span>
              <span className="font-mono text-xl font-bold text-white">
                {total.toLocaleString("ru-BY")} BYN
              </span>
            </div>
            <div className="flex items-baseline justify-between rounded-xl bg-zinc-950 p-4">
              <span className="font-semibold text-white">Ваша цена</span>
              <span className="text-right">
                <span className="text-3xl font-extrabold text-emerald-400">
                  от 990 BYN
                </span>
                <span className="ml-2 text-sm text-zinc-400">/мес</span>
                <div className="mt-1 text-xs text-zinc-500">
                  ({Math.round(total / 990)}× меньше воспринимаемой ценности)
                </div>
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Button size="lg" className="gap-2 bg-blue-600 text-white hover:bg-blue-700" asChild>
            <a href="#cta">
              Заказать аудит — забрать всё это
              <ArrowRight className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  USP Section — 4 key advantages for Belarusian market               */
/* ------------------------------------------------------------------ */
function USPSection() {
  const usps = [
    {
      icon: Server,
      title: "Цена SaaS, контур on-prem",
      description:
        "Старт от 990 BYN/мес в облаке. По мере роста — миграция на собственный контур без смены вендора и переобучения операторов. Единственная такая модель на рынке РБ.",
    },
    {
      icon: Lock,
      title: "Без OpenAI и Anthropic",
      description:
        "Локальные LLM (Llama 3, Qwen 2.5, GigaChat). Снимаем санкционно-комплаенсный риск для банков, госструктур и регулируемых отраслей. ПДн не покидают РБ.",
    },
    {
      icon: Languages,
      title: "Whisper под русский и белорусский",
      description:
        "Open-source ASR fine-tuned под белорусскую разговорную речь и code-switching рус./бел. Точность 95 % на телефонном качестве. Этого нет ни у одного российского вендора.",
    },
    {
      icon: Rocket,
      title: "Live за 1 день, аудит за неделю",
      description:
        "Self-service онбординг, готовые шаблоны скриптов под банк, ритейл, медклинику. Первые инсайты на 100 загруженных звонках в течение часа. Не 6 месяцев интегратора.",
    },
  ];

  return (
    <section className="bg-gradient-to-b from-zinc-950 to-zinc-900 py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <span className="mb-4 inline-flex rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-400">
            Для рынка Республики Беларусь
          </span>
          <h2 className="mt-4 text-3xl font-bold text-white md:text-4xl">
            Почему белорусские контакт-центры выбирают нас
          </h2>
          <p className="mt-3 text-zinc-400">
            Четыре отличия, которые делают SpeechLyt единственным реалистичным выбором
            для регулируемых отраслей в РБ.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {usps.map((u) => (
            <div
              key={u.title}
              className="relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/60 p-6 backdrop-blur transition-all hover:border-blue-500/40 hover:bg-zinc-900/90"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                <u.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-white">{u.title}</h3>
              <p className="text-sm leading-relaxed text-zinc-400">
                {u.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Key Metrics Section                                                */
/* ------------------------------------------------------------------ */
function MetricsSection() {
  const metrics = [
    { value: "95 %", label: "Точность Whisper на телефонном RU", icon: Mic },
    { value: "−40 %", label: "Среднее время обработки звонка", icon: TrendingUp },
    { value: "+35 %", label: "Конверсия продаж на пилотах", icon: Phone },
    { value: "100 %", label: "Покрытие звонков анализом", icon: Shield },
    { value: "+28 %", label: "Рост удовлетворённости (CSAT)", icon: Users },
    { value: "1 день", label: "От загрузки до первых инсайтов", icon: Zap },
  ];

  return (
    <section id="metrics" className="bg-white py-20 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-zinc-900 dark:text-white">
            Реальные результаты
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Ключевые метрики наших клиентов после внедрения SpeechLyt
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {metrics.map((m) => (
            <Card
              key={m.label}
              className="group border-zinc-200 transition-shadow hover:shadow-lg dark:border-zinc-800"
            >
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:group-hover:bg-blue-500/20">
                  <m.icon className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-zinc-900 dark:text-white">
                    {m.value}
                  </div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">
                    {m.label}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Features Grid                                                      */
/* ------------------------------------------------------------------ */
function FeaturesSection() {
  const features = [
    {
      icon: Mic,
      title: "AI-аналитика звонков",
      description:
        "Whisper-транскрипция с диаризацией, определение тональности, категоризация тем и выявление ключевых фраз — на ваших серверах или в облаке РБ.",
    },
    {
      icon: BarChart3,
      title: "KPI-дашборд",
      description:
        "Мониторинг метрик в реальном времени: AHT, FCR, CSAT-прокси. Тренды, тепловые карты нагрузки и облака слов с фильтрами по операторам и проектам.",
    },
    {
      icon: FileText,
      title: "Скрипт-комплаенс",
      description:
        "Контроль соблюдения скриптов продаж и обслуживания. Автоматическая оценка прохождения этапов и подсчёт обязательных формулировок.",
    },
    {
      icon: Shield,
      title: "Авто-QA",
      description:
        "Настраиваемые чек-листы для оценки звонков. AI заполняет 80 % полей, супервайзер только утверждает — экономия 60 % времени QA-команды.",
    },
    {
      icon: Users,
      title: "AI-коучинг операторов",
      description:
        "Лидерборд по KPI, персональные рекомендации каждому оператору на основе истории его звонков, отслеживание прогресса в динамике.",
    },
    {
      icon: Bell,
      title: "Real-time алерты",
      description:
        "Подсказки оператору во время звонка (Phase 2). Моментальные уведомления супервайзеру в Telegram/Email при критических нарушениях.",
    },
  ];

  return (
    <section id="features" className="bg-zinc-50 py-20 dark:bg-zinc-900">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-zinc-900 dark:text-white">
            Все инструменты на одной платформе
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Полный набор возможностей для управления качеством контакт-центра
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Card
              key={f.title}
              className="group border-zinc-200 transition-all hover:-translate-y-1 hover:shadow-lg dark:border-zinc-800"
            >
              <CardContent className="p-6">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-white">
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {f.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Platform Modules Showcase                                          */
/* ------------------------------------------------------------------ */
function ModulesSection() {
  const modules = [
    {
      tag: "Аналитика",
      title: "Анализ каждого звонка в деталях",
      description:
        "Полная транскрипция с разметкой по ролям, определение эмоций в реальном времени, автоматическая категоризация и оценка соответствия скрипту. Интеллектуальный поиск по всей базе звонков.",
      features: [
        "Транскрипция с точностью 95 %",
        "Анализ тональности и эмоций",
        "Категоризация по темам",
        "Полнотекстовый поиск",
      ],
      preview: <MockCalls />,
    },
    {
      tag: "Дашборд",
      title: "Полная картина в реальном времени",
      description:
        "Все ключевые метрики контакт-центра на одном экране. Интерактивные графики, тепловые карты нагрузки, облака слов и автоматическое сравнение с предыдущим периодом.",
      features: [
        "KPI в реальном времени",
        "Тренды и тепловые карты",
        "Облако ключевых слов",
        "Сравнение по периодам",
      ],
      preview: <MockDashboard />,
    },
    {
      tag: "Качество",
      title: "Контроль качества на автопилоте",
      description:
        "QA-чек-листы с автоматическим заполнением, рейтинг операторов по всем показателям и отслеживание соблюдения скриптов продаж. Полная прозрачность работы контакт-центра.",
      features: [
        "QA-оценки с AI-помощником",
        "Лидерборд операторов",
        "Контроль скриптов продаж",
        "Отчёты и экспорт",
      ],
      preview: <MockQA />,
    },
  ];

  return (
    <section id="modules" className="bg-white py-20 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-zinc-900 dark:text-white">
            Модули платформы
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Каждый модуль решает конкретную задачу контакт-центра
          </p>
        </div>

        <div className="space-y-24">
          {modules.map((mod, idx) => (
            <div
              key={mod.tag}
              className={`flex flex-col items-center gap-12 lg:flex-row ${
                idx % 2 === 1 ? "lg:flex-row-reverse" : ""
              }`}
            >
              <div className="flex-1 space-y-5">
                <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                  {mod.tag}
                </span>
                <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">
                  {mod.title}
                </h3>
                <p className="leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {mod.description}
                </p>
                <ul className="space-y-2">
                  {mod.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300"
                    >
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="w-full max-w-xl flex-1">
                <div className="relative">
                  <div className="absolute -inset-3 rounded-2xl bg-gradient-to-r from-blue-600/10 to-cyan-500/10 blur-lg" />
                  <div className="relative">{mod.preview}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Cases Section — реальный клиент + NDA-кейсы                        */
/* ------------------------------------------------------------------ */
function CasesSection() {
  const featured = {
    name: "Дана Холдинг",
    industry: "Девелопмент · ритейл · образование · медицина",
    description:
      "Один из крупнейших диверсифицированных холдингов Беларуси. Контакт-центры по нескольким бизнес-юнитам: продажи недвижимости, обслуживание ТРЦ, медицинские центры, образовательные учреждения.",
    metrics: [
      { value: "100 %", label: "звонков под аналитикой" },
      { value: "+22 %", label: "конверсия отдела продаж" },
      { value: "−35 %", label: "время супервайзеров на QA" },
      { value: "8 нед", label: "от пилота до прод-внедрения" },
    ],
    quote:
      "До SpeechLyt мы выборочно слушали 3-5 % звонков и видели только верхушку айсберга. Сейчас вся картина в одном дашборде — где теряем сделки, где скрипт ломается, кого из операторов нужно учить. Окупилось за квартал.",
    role: "Руководитель контакт-центра",
  };

  const ndaCases = [
    {
      industry: "Системно значимый банк",
      icon: Building2,
      meta: "1 200+ операторов · on-prem · ОАЦ-комплаенс",
      bullets: [
        "Полное on-prem развёртывание с локальными LLM (без OpenAI)",
        "Интеграция с CRM банка и системой записи звонков",
        "Автоматический контроль 100 % обращений по антифрод-скриптам",
      ],
      results: [
        { value: "+18 %", label: "обнаружение нарушений скрипта" },
        { value: "−42 ч/нед", label: "ручного QA супервайзеров" },
      ],
    },
    {
      industry: "Телеком-оператор РБ",
      icon: Building2,
      meta: "350 операторов · SaaS в облаке РБ · Asterisk-интеграция",
      bullets: [
        "Real-time подсказки операторам в моменте звонка",
        "AI-коучинг с персональными рекомендациями каждому оператору",
        "Дашборды по тарифам / отделам / временам пиков",
      ],
      results: [
        { value: "+27 %", label: "удержание клиентов на спорных кейсах" },
        { value: "−19 %", label: "AHT в среднем по контакт-центру" },
      ],
    },
    {
      industry: "Страховая компания",
      icon: Building2,
      meta: "180 операторов · смешанная модель · GigaChat-LLM",
      bullets: [
        "Контроль обязательных пунктов скрипта при оформлении полиса",
        "Авто-QA с 80 % auto-fill чек-листов",
        "Сегментация по эмоциям клиентов для прогноза churn",
      ],
      results: [
        { value: "+14 %", label: "конверсия в оформление полиса" },
        { value: "+9 %", label: "CSAT по результатам опросов" },
      ],
    },
    {
      industry: "Розничная сеть",
      icon: Building2,
      meta: "60 операторов · Growth-тариф · 14 дней до запуска",
      bullets: [
        "Анализ обращений по доставке, возвратам и претензиям",
        "Алерты в Telegram при критических нарушениях",
        "Сравнение операторов между магазинами и регионами",
      ],
      results: [
        { value: "−24 %", label: "повторные обращения (FCR ↑)" },
        { value: "3 нед", label: "окупаемость подписки" },
      ],
    },
  ];

  return (
    <section id="cases" className="bg-white py-20 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <span className="mb-4 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
            Реальные внедрения
          </span>
          <h2 className="mt-4 text-3xl font-bold text-zinc-900 dark:text-white md:text-4xl">
            Клиенты, которые уже зарабатывают на 100 % звонков
          </h2>
          <p className="mt-3 text-zinc-600 dark:text-zinc-400">
            Часть кейсов — под NDA: имена скрыты, метрики и отрасль реальные.
          </p>
        </div>

        {/* Featured case — Дана Холдинг */}
        <div className="mb-10 overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 via-white to-cyan-50 shadow-xl dark:border-blue-500/30 dark:from-blue-950/40 dark:via-zinc-950 dark:to-cyan-950/30">
          <div className="grid gap-8 p-8 md:grid-cols-5 md:p-10">
            {/* Left: client info */}
            <div className="md:col-span-2">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-600 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                <Building2 className="h-3.5 w-3.5" />
                Featured клиент
              </div>
              <h3 className="text-3xl font-extrabold text-zinc-900 dark:text-white">
                {featured.name}
              </h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                {featured.industry}
              </p>
              <p className="mt-4 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                {featured.description}
              </p>

              {/* Quote */}
              <div className="mt-6 rounded-xl border-l-4 border-blue-600 bg-white p-4 dark:bg-zinc-900">
                <Quote className="mb-2 h-5 w-5 text-blue-600 dark:text-blue-400" />
                <p className="text-sm italic leading-relaxed text-zinc-700 dark:text-zinc-300">
                  «{featured.quote}»
                </p>
                <p className="mt-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                  — {featured.role}, Дана Холдинг
                </p>
              </div>
            </div>

            {/* Right: metrics */}
            <div className="md:col-span-3">
              <div className="grid grid-cols-2 gap-4">
                {featured.metrics.map((m) => (
                  <div
                    key={m.label}
                    className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <div className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">
                      {m.value}
                    </div>
                    <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                      {m.label}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-xl bg-white p-5 dark:bg-zinc-900">
                <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Что мы внедрили
                </div>
                <ul className="space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
                    <span>Whisper-транскрипция всех каналов с диаризацией ролей</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
                    <span>Скрипт-комплаенс под каждый бизнес-юнит отдельно</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
                    <span>Авто-QA с 80 % auto-fill чек-листов</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
                    <span>Сравнительные дашборды между бизнес-юнитами</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* NDA cases grid */}
        <div className="mb-6 flex items-center gap-2">
          <EyeOff className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
          <span className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Под NDA — отрасль и метрики реальные, имя клиента скрыто
          </span>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {ndaCases.map((c) => (
            <div
              key={c.industry}
              className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 transition-all hover:border-blue-300 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-500/40"
            >
              {/* NDA watermark */}
              <div className="pointer-events-none absolute right-4 top-4 rotate-12 rounded-md border border-zinc-300 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:border-zinc-700 dark:text-zinc-600">
                NDA
              </div>

              <div className="mb-4 flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                  <c.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                    {c.industry}
                  </h3>
                  <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                    {c.meta}
                  </p>
                </div>
              </div>

              {/* What we did */}
              <ul className="mb-4 space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
                {c.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>

              {/* Results */}
              <div className="grid grid-cols-2 gap-3 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-950">
                {c.results.map((r) => (
                  <div key={r.label}>
                    <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
                      {r.value}
                    </div>
                    <div className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400">
                      {r.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Trust strip */}
        <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-zinc-200 bg-zinc-50 p-6 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-700 dark:text-zinc-300">
            Хотите быть в нашем «Featured кейсе» вместо NDA?{" "}
            <strong className="text-zinc-900 dark:text-white">
              При публичном кейсе и логотипе на сайте — скидка 25 % на годовую подписку.
            </strong>
          </p>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Guarantee Section — Conditional money-back                         */
/* ------------------------------------------------------------------ */
function GuaranteeSection() {
  return (
    <section
      id="guarantee"
      className="relative overflow-hidden bg-gradient-to-b from-zinc-950 via-blue-950/40 to-zinc-950 py-20"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)]" />

      <div className="relative mx-auto max-w-4xl px-6">
        <div className="rounded-3xl border-2 border-blue-500/30 bg-zinc-900/80 p-8 backdrop-blur md:p-12">
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-500/20 text-blue-400">
              <Award className="h-8 w-8" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                Conditional money-back guarantee
              </span>
              <h2 className="text-2xl font-bold text-white md:text-3xl">
                Гарантия результата за 90 дней
              </h2>
            </div>
          </div>

          <p className="mb-6 text-lg leading-relaxed text-zinc-300">
            Если за 90 дней после запуска SpeechLyt мы{" "}
            <strong className="text-white">не достигнем хотя бы одной</strong> из метрик:
          </p>

          <div className="mb-6 grid gap-3 md:grid-cols-3">
            <div className="rounded-xl bg-zinc-950 p-4">
              <div className="text-2xl font-extrabold text-blue-400">+15 %</div>
              <div className="mt-1 text-xs text-zinc-400">
                рост качества обслуживания (QA-скоры)
              </div>
            </div>
            <div className="rounded-xl bg-zinc-950 p-4">
              <div className="text-2xl font-extrabold text-blue-400">−30 ч / мес</div>
              <div className="mt-1 text-xs text-zinc-400">
                экономия времени супервайзера
              </div>
            </div>
            <div className="rounded-xl bg-zinc-950 p-4">
              <div className="text-2xl font-extrabold text-blue-400">+10 %</div>
              <div className="mt-1 text-xs text-zinc-400">
                рост конверсии (для отделов продаж)
              </div>
            </div>
          </div>

          <p className="mb-6 text-lg leading-relaxed text-zinc-300">
            — мы{" "}
            <strong className="text-white">возвращаем 100 % уплаченной подписки</strong>.
            И вы{" "}
            <strong className="text-white">оставляете себе все данные и аналитику</strong>,
            которую мы для вас построили.
          </p>

          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
            <p className="text-sm text-amber-200">
              <strong>Почему мы можем себе это позволить:</strong> наш пилот уже у 12 КЦ
              в РБ — медианный результат +24 % качества за первый квартал.
              Возврат — наш операционный риск, не ваш бизнес-риск.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Pricing Section — 4 tiers in BYN                                   */
/* ------------------------------------------------------------------ */
function PricingSection() {
  const [annual, setAnnual] = useState(false);

  const tiers = [
    {
      name: "Starter",
      tagline: "Для небольших отделов продаж и медклиник",
      monthly: 990,
      annualMonthly: 792,
      setup: 1500,
      minMonths: 6,
      operators: "до 15",
      minutes: "5 000 мин/мес",
      stackValue: 18000,
      cta: "Заказать аудит",
      ctaHref: "#cta",
      featured: false,
      features: [
        "Whisper-транскрипция RU/BY",
        "Speaker diarization",
        "1 чек-лист скрипт-комплаенс",
        "AHT / FCR метрики",
        "Дашборд супервайзера",
        "Экспорт CSV / JSON",
        "Поддержка по email",
      ],
    },
    {
      name: "Growth",
      tagline: "Самый популярный — растущим КЦ и банкам-челленджерам",
      monthly: 2490,
      annualMonthly: 1992,
      setup: 3000,
      minMonths: 3,
      operators: "до 50",
      minutes: "25 000 мин/мес",
      stackValue: 45000,
      cta: "Заказать аудит",
      ctaHref: "#cta",
      featured: true,
      features: [
        "Всё из Starter +",
        "До 5 чек-листов скриптов",
        "Анализ эмоций",
        "AI-резюме каждого звонка",
        "CSAT-прокси и тематика",
        "Алерты в Telegram / Email",
        "REST API + Webhooks",
        "Bitrix24 / amoCRM интеграция",
        "Чат + email поддержка",
      ],
    },
    {
      name: "Business",
      tagline: "Крупные банки, телеком, страховщики 50–200 операторов",
      monthly: 6990,
      annualMonthly: 5592,
      setup: 8000,
      minMonths: 6,
      operators: "до 200",
      minutes: "80 000 мин/мес",
      stackValue: 95000,
      cta: "Запросить расширенный аудит",
      ctaHref: "#cta",
      featured: false,
      scarcity: "Только 3 слота / квартал",
      features: [
        "Всё из Growth +",
        "Real-time подсказки оператору",
        "AI-коучинг по истории звонков",
        "Авто-QA (80 % auto-fill)",
        "Неограниченные чек-листы",
        "Кастомные KPI-формулы",
        "SSO (SAML / OIDC)",
        "Приоритетная поддержка 24/7",
        "Выделенный senior CSM",
      ],
    },
    {
      name: "Enterprise / On-Prem",
      tagline: "A1, МТС, life:, Беларусбанк, госзаказ — 200+ операторов",
      monthly: 29900,
      annualMonthly: 23920,
      onPrem: 145000,
      setup: 15000,
      minMonths: 12,
      operators: "без лимита",
      minutes: "без лимита",
      stackValue: 350000,
      cta: "Связаться с продажами",
      ctaHref: "#cta",
      featured: false,
      features: [
        "Всё из Business +",
        "On-prem развёртывание",
        "Локальные LLM (Llama 3 / Qwen 2.5 / GigaChat)",
        "Без зависимости от OpenAI / Anthropic",
        "White-label (логотип, домен, цвета)",
        "Кастомные ASR / NLU модели",
        "Выделенный VPC",
        "Аудит-логи под комплаенс РБ",
        "Dedicated CSM + SRE",
        "ОАЦ-сертификация (по запросу)",
      ],
    },
  ];

  return (
    <section id="pricing" className="relative bg-zinc-50 py-20 dark:bg-zinc-900">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <span className="mb-4 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
            Прозрачные цены в BYN
          </span>
          <h2 className="mt-4 text-3xl font-bold text-zinc-900 dark:text-white md:text-4xl">
            Тарифы для контакт-центров любого размера
          </h2>
          <p className="mt-3 text-zinc-600 dark:text-zinc-400">
            Договор и оплата в белорусских рублях с резидентом ПВТ.
            Скидка 20 % при годовой предоплате. Trial-периодов нет — мы делаем
            платный аудит, который засчитывается в подписку.
          </p>

          <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-zinc-200 bg-white p-1 dark:border-zinc-700 dark:bg-zinc-950">
            <button
              onClick={() => setAnnual(false)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                !annual
                  ? "bg-blue-600 text-white shadow"
                  : "text-zinc-600 dark:text-zinc-400"
              }`}
            >
              Помесячно
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                annual
                  ? "bg-blue-600 text-white shadow"
                  : "text-zinc-600 dark:text-zinc-400"
              }`}
            >
              Год{" "}
              <span
                className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  annual
                    ? "bg-white/20 text-white"
                    : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                }`}
              >
                −20 %
              </span>
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {tiers.map((t) => {
            const price = annual ? t.annualMonthly : t.monthly;
            const valueRatio = Math.round(t.stackValue / t.monthly);
            return (
              <div
                key={t.name}
                className={`relative flex flex-col rounded-2xl border p-6 transition-all ${
                  t.featured
                    ? "scale-[1.02] border-blue-500 bg-white shadow-2xl shadow-blue-500/10 dark:bg-zinc-950"
                    : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
                }`}
              >
                {t.featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-lg">
                    Популярный
                  </span>
                )}

                {t.scarcity && (
                  <span className="absolute -top-3 right-3 rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow">
                    {t.scarcity}
                  </span>
                )}

                <div className="mb-4">
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                    {t.name}
                  </h3>
                  <p className="mt-1 min-h-[40px] text-xs text-zinc-500 dark:text-zinc-400">
                    {t.tagline}
                  </p>
                </div>

                {/* Stack value highlight */}
                <div className="mb-3 rounded-lg bg-blue-50 p-2 text-center dark:bg-blue-500/10">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                    Стек стоит
                  </div>
                  <div className="font-mono text-sm font-bold text-blue-900 dark:text-blue-300">
                    {t.stackValue.toLocaleString("ru-BY")} BYN
                  </div>
                </div>

                <div className="mb-2 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-zinc-900 dark:text-white">
                    {price.toLocaleString("ru-BY")}
                  </span>
                  <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                    BYN/мес
                  </span>
                </div>

                {annual && (
                  <p className="mb-1 text-xs text-zinc-400 line-through dark:text-zinc-500">
                    {t.monthly.toLocaleString("ru-BY")} BYN
                  </p>
                )}

                <p className="mb-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  Это в {valueRatio}× меньше воспринимаемой ценности
                </p>

                {t.onPrem && (
                  <p className="mb-1 text-xs text-zinc-600 dark:text-zinc-400">
                    или on-prem от{" "}
                    <strong className="text-zinc-900 dark:text-white">
                      {t.onPrem.toLocaleString("ru-BY")} BYN
                    </strong>{" "}
                    one-time + 18 %/год
                  </p>
                )}

                <div className="mb-6 mt-3 grid grid-cols-2 gap-2 rounded-lg bg-zinc-50 p-3 text-xs dark:bg-zinc-900">
                  <div>
                    <div className="text-zinc-500 dark:text-zinc-400">Операторов</div>
                    <div className="font-semibold text-zinc-900 dark:text-white">
                      {t.operators}
                    </div>
                  </div>
                  <div>
                    <div className="text-zinc-500 dark:text-zinc-400">ASR</div>
                    <div className="font-semibold text-zinc-900 dark:text-white">
                      {t.minutes}
                    </div>
                  </div>
                  <div>
                    <div className="text-zinc-500 dark:text-zinc-400">Setup</div>
                    <div className="font-semibold text-zinc-900 dark:text-white">
                      {t.setup.toLocaleString("ru-BY")} BYN
                    </div>
                  </div>
                  <div>
                    <div className="text-zinc-500 dark:text-zinc-400">Минимум</div>
                    <div className="font-semibold text-zinc-900 dark:text-white">
                      {t.minMonths} мес
                    </div>
                  </div>
                </div>

                <ul className="mb-6 flex-1 space-y-2.5">
                  {t.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  className={
                    t.featured
                      ? "w-full bg-blue-600 text-white hover:bg-blue-700"
                      : "w-full"
                  }
                  variant={t.featured ? "default" : "outline"}
                >
                  <a href={t.ctaHref}>
                    {t.cta}
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </a>
                </Button>
              </div>
            );
          })}
        </div>

        <div className="mx-auto mt-10 max-w-4xl rounded-xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
          <h4 className="mb-3 font-semibold text-zinc-900 dark:text-white">
            Что важно знать о тарифах
          </h4>
          <ul className="grid gap-2 md:grid-cols-2">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-blue-500" />
              <span>
                Цены зафиксированы в BYN на квартал (USD = 2,85 BYN, RUB = 0,038 BYN
                по курсу НБРБ).
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-blue-500" />
              <span>
                Скидки за предоплату: −5 % квартал, −12 % полугодие, −20 % год.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-blue-500" />
              <span>
                Доп. минуты ASR сверх лимита: 0,05 BYN/мин (от 100k мин — 0,03 BYN/мин).
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-blue-500" />
              <span>
                Add-ons: white-label (+500 BYN/мес), кастомная интеграция (от 2 500 one-time),
                кастом ASR (5–15k one-time).
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-blue-500" />
              <span>
                Договор с резидентом ПВТ Беларусь — оплата в BYN, без валютного контроля.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-blue-500" />
              <span>
                Платный аудит контакт-центра от 1 500 BYN — анализ 100 ваших звонков с
                письменным отчётом за 7 дней. При подключении тарифа сумма аудита
                засчитывается.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Integrations                                                       */
/* ------------------------------------------------------------------ */
function IntegrationsSection() {
  const integrations = [
    { icon: Globe, label: "REST API", desc: "Полноценный API для интеграции" },
    { icon: Webhook, label: "Webhooks", desc: "Уведомления в реальном времени" },
    { icon: KeyRound, label: "API-ключи", desc: "Безопасная авторизация" },
    { icon: Phone, label: "CRM / ВАТС", desc: "Bitrix24, amoCRM, Asterisk, 3CX" },
  ];

  return (
    <section className="bg-white py-20 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-zinc-900 dark:text-white">
            Интеграции и API
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Подключайте SpeechLyt к вашей существующей инфраструктуре
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {integrations.map((i) => (
            <Card
              key={i.label}
              className="border-zinc-200 text-center transition-shadow hover:shadow-md dark:border-zinc-800"
            >
              <CardContent className="flex flex-col items-center p-6">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                  <i.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-1 font-semibold text-zinc-900 dark:text-white">
                  {i.label}
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {i.desc}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  FAQ Section — Belarus-focused                                      */
/* ------------------------------------------------------------------ */
function FAQSection() {
  const items = [
    {
      q: "Как работает гарантия возврата за 90 дней?",
      a: "В договоре фиксируем 3 целевые метрики: +15 % качества обслуживания (по AI-QA-скорам), −30 часов в месяц времени супервайзера, +10 % конверсии (для отделов продаж). Если за 90 дней мы не достигли хотя бы одной из них — возвращаем 100 % уплаченной подписки. Аналитика, отчёты и интеграции остаются у вас. Условие гарантии — вы загружаете не менее 80 % звонков и согласовываете базовый чек-лист скриптов в первые 14 дней.",
    },
    {
      q: "Как вы решаете проблему недоступности OpenAI и Anthropic в РБ?",
      a: "Для регулируемых клиентов мы разворачиваем on-prem с локальными LLM (Llama 3, Qwen 2.5, GigaChat по API через Sber). Whisper-транскрипция работает на ваших GPU без выхода во вне. ПДн не покидают РБ — нет нужды в разрешении НЦЗПД на трансграничную передачу. Это снимает санкционно-комплаенсный риск для банков, госструктур и силовых.",
    },
    {
      q: "Соответствуете ли вы закону №99-З о персональных данных РБ?",
      a: "Да. SaaS-версия хостится на серверах в РБ с шифрованием данных при передаче и хранении. On-prem развёртывание полностью изолирует контур клиента. Также готовим ОАЦ-сертификацию по ТР 2013/027/BY и Приказу №66 для продаж в госсектор и системно значимые банки.",
    },
    {
      q: "Чем вы отличаетесь от 3iTech и ЦРТ?",
      a: "Мы в 4-5 раз дешевле on-prem-лицензий (от 145 000 BYN one-time vs от 700 000 BYN у 3iTech), запуск за 1 день вместо 3-6 месяцев, современный AI-стек (Whisper + LLM) вместо legacy фонетического ASR. И что критично — оплата в BYN с белорусским юрлицом, без российского санкционного риска для вашего комплаенса.",
    },
    {
      q: "Какие форматы аудио и интеграции поддерживаются?",
      a: "WAV, MP3, OGG, FLAC. Размер файла до 500 МБ, пакетная загрузка, потоковая передача через REST API. Готовые интеграции с Bitrix24 BY, amoCRM, Asterisk, 3CX. Webhooks для CRM-уведомлений. Кастомные интеграции (Cisco, ВАТС белорусских операторов) от 2 500 BYN one-time.",
    },
    {
      q: "Почему у вас нет бесплатного триала?",
      a: "Бесплатные триалы привлекают «туристов», которые не покупают, а серьёзные заказчики B2B в РБ предпочитают платную проверку — это сигнал, что вендор работает с реальными деньгами и берёт ответственность за результат. Поэтому мы делаем платный аудит контакт-центра: анализ 100 ваших звонков за 7 дней, письменный отчёт с найденными нарушениями скрипта и потенциалом роста KPI. Базовая стоимость — 1 500 BYN, при подключении тарифа сумма засчитывается в первую оплату.",
    },
    {
      q: "Что входит в платный аудит за 7 дней?",
      a: "Вы загружаете 100 реальных звонков вашего контакт-центра. Мы готовим: (1) отчёт о соблюдении скрипта с цитатами нарушений, (2) сегментацию по эмоциям клиентов, (3) расчёт KPI — AHT, FCR, CSAT-прокси, (4) сравнение операторов между собой, (5) оценку потенциала роста конверсии в деньгах. Базовый аудит — 1 500 BYN, расширенный (500 звонков + кастомные KPI) — 5 000 BYN. Для крупных enterprise-проектов делаем индивидуальный объём.",
    },
    {
      q: "Можно ли оплачивать в рассрочку или с НДС-вычетом?",
      a: "Договор заключается с резидентом ПВТ Беларусь — оплата в BYN по счёту, для юрлиц возможна рассрочка квартальными платежами на тарифах Business и Enterprise. Резиденты ПВТ работают по льготному режиму (1 % с выручки), что отражено в наших ценах.",
    },
    {
      q: "Сколько операторов поддерживает платформа?",
      a: "Starter — до 15, Growth — до 50, Business — до 200, Enterprise — без лимита. Платформа масштабируется горизонтально (Kubernetes), поддерживает мульти-проектную и мульти-командную работу с ролевой моделью доступа.",
    },
  ];

  return (
    <section id="faq" className="bg-zinc-50 py-20 dark:bg-zinc-900">
      <div className="mx-auto max-w-3xl px-6">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-zinc-900 dark:text-white">
            Часто задаваемые вопросы
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Что чаще всего спрашивают белорусские контакт-центры
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {items.map((item, idx) => (
            <AccordionItem key={idx} value={`item-${idx}`}>
              <AccordionTrigger className="text-left text-zinc-900 hover:no-underline dark:text-white">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-zinc-600 dark:text-zinc-400">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Final CTA — Bundle stack with bonuses + scarcity + urgency         */
/* ------------------------------------------------------------------ */
function CTASection() {
  return (
    <section
      id="cta"
      className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-600 py-20"
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="relative mx-auto max-w-5xl px-6">
        {/* Urgency strip */}
        <div className="mx-auto mb-6 flex max-w-md items-center justify-center gap-2 rounded-full border border-amber-300/50 bg-amber-500/20 px-4 py-2 text-sm font-semibold text-amber-100 backdrop-blur">
          <Clock className="h-4 w-4 animate-pulse" />
          Цена 1 500 BYN до 1 июня 2026 — далее 3 000 BYN
        </div>

        <div className="text-center">
          <h2 className="mb-4 text-3xl font-bold text-white md:text-5xl">
            Заберите все ваши деньги,
            <br />
            которые сейчас теряются на звонках
          </h2>
          <p className="mb-10 text-lg text-blue-100">
            Аудит за 1 500 BYN покажет точные цифры. Никаких бесплатных триалов
            — серьёзные деньги требуют серьёзных решений.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Standard audit card */}
          <div className="relative rounded-2xl border-2 border-white/30 bg-white p-6 shadow-2xl">
            <div className="mb-4">
              <div className="mb-2 flex items-center gap-2">
                <Rocket className="h-5 w-5 text-blue-600" />
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                  SMB и mid-market (5–50 операторов)
                </span>
              </div>
              <h3 className="mb-1 text-2xl font-bold text-zinc-900">
                Аудит контакт-центра
              </h3>
              <p className="text-sm text-zinc-600">
                100 звонков · отчёт за 7 дней
              </p>
            </div>

            <div className="mb-5 flex items-baseline gap-2">
              <span className="text-5xl font-extrabold text-zinc-900">1 500</span>
              <span className="text-lg font-semibold text-zinc-600">BYN</span>
              <span className="ml-1 text-sm text-zinc-500 line-through">3 000</span>
            </div>

            <div className="mb-5 space-y-2 text-sm text-zinc-700">
              <div className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <span>Отчёт о соблюдении скрипта с цитатами нарушений</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <span>Сегментация по эмоциям клиентов</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <span>AHT / FCR / CSAT с разбором по операторам</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <span>
                  <strong>Оценка потерянной выручки в BYN</strong>
                </span>
              </div>
            </div>

            {/* Bonuses bundle */}
            <div className="mb-5 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-amber-900">
                <Gift className="h-4 w-4" /> Бонусы при заказе сегодня
              </div>
              <ul className="space-y-1.5 text-xs text-zinc-700">
                <li className="flex items-start gap-1.5">
                  <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-600" />
                  <span>14 дней консультаций с CSM (ценность 800 BYN)</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-600" />
                  <span>Шаблоны скриптов под отрасль (ценность 1 200 BYN)</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-600" />
                  <span>Сравнение «вы vs топ-3 КЦ РБ» (ценность 2 500 BYN)</span>
                </li>
              </ul>
              <div className="mt-2 text-right text-xs font-semibold text-amber-900">
                Бонусов на 4 500 BYN — бесплатно
              </div>
            </div>

            <p className="mb-4 rounded-lg bg-emerald-50 p-3 text-center text-sm font-semibold text-emerald-900">
              Сумма аудита 100 % засчитывается в первую оплату тарифа
            </p>

            <Button
              size="lg"
              className="w-full gap-2 bg-blue-600 text-white hover:bg-blue-700"
            >
              Заказать аудит за 1 500 BYN
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Enterprise audit card */}
          <div className="relative rounded-2xl border-2 border-white/30 bg-zinc-950 p-6 shadow-2xl">
            <div className="absolute -top-3 left-6 rounded-full bg-amber-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow">
              Только 3 слота / квартал
            </div>

            <div className="mb-4">
              <div className="mb-2 flex items-center gap-2">
                <Shield className="h-5 w-5 text-cyan-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-cyan-300">
                  Банки, телеком, госы (50–500+ операторов)
                </span>
              </div>
              <h3 className="mb-1 text-2xl font-bold text-white">
                Расширенный аудит + PoC
              </h3>
              <p className="text-sm text-zinc-400">
                500 звонков · кастомные KPI · 7–14 дней
              </p>
            </div>

            <div className="mb-5 flex items-baseline gap-2">
              <span className="text-5xl font-extrabold text-white">от 5 000</span>
              <span className="text-lg font-semibold text-zinc-300">BYN</span>
            </div>

            <div className="mb-5 space-y-2 text-sm text-zinc-300">
              <div className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                <span>Всё из базового аудита +</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                <span>500 звонков + кастомные KPI под отрасль</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                <span>Демо-развёртывание on-prem на ваших данных</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                <span>Презентация результатов вашему руководству</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                <span>
                  <strong className="text-white">Roadmap внедрения с ROI-моделью</strong>
                </span>
              </div>
            </div>

            <div className="mb-5 rounded-xl border border-amber-400/40 bg-amber-500/10 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-amber-200">
                <Gift className="h-4 w-4" /> Бонусы Enterprise
              </div>
              <ul className="space-y-1.5 text-xs text-zinc-300">
                <li className="flex items-start gap-1.5">
                  <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-400" />
                  <span>Воркшоп с senior-командой Utlik (ценность 4 000 BYN)</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-400" />
                  <span>ОАЦ-комплаенс чек-лист (ценность 3 000 BYN)</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-400" />
                  <span>Приоритет в очереди внедрения (ценность ~30 дней)</span>
                </li>
              </ul>
              <div className="mt-2 text-right text-xs font-semibold text-amber-200">
                Бонусов на 7 000+ BYN
              </div>
            </div>

            <p className="mb-4 rounded-lg bg-emerald-500/10 p-3 text-center text-sm font-semibold text-emerald-300">
              Засчитывается в первую оплату Business / Enterprise
            </p>

            <Button
              size="lg"
              className="w-full gap-2 border-2 border-white bg-transparent text-white hover:bg-white hover:text-blue-700"
            >
              Обсудить расширенный аудит
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Trust strip */}
        <div className="mt-10 grid gap-4 rounded-2xl border border-white/20 bg-white/5 p-6 backdrop-blur md:grid-cols-3">
          <div className="flex items-center gap-3">
            <Award className="h-8 w-8 shrink-0 text-amber-300" />
            <div>
              <div className="text-sm font-semibold text-white">Гарантия 90 дней</div>
              <div className="text-xs text-blue-100">+15 % качества или возврат</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Lock className="h-8 w-8 shrink-0 text-cyan-300" />
            <div>
              <div className="text-sm font-semibold text-white">Резидент ПВТ</div>
              <div className="text-xs text-blue-100">BYN, без валютного контроля</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Server className="h-8 w-8 shrink-0 text-emerald-300" />
            <div>
              <div className="text-sm font-semibold text-white">Без OpenAI</div>
              <div className="text-xs text-blue-100">Локальные LLM в РБ-контуре</div>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-blue-100">
          Договор с резидентом ПВТ Беларусь · Оплата в BYN · Без валютного контроля
        </p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Footer                                                             */
/* ------------------------------------------------------------------ */
function LandingFooter() {
  return (
    <footer className="border-t border-zinc-200 bg-white py-12 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Headphones className="h-5 w-5 text-blue-600" />
              <span className="text-lg font-bold text-zinc-900 dark:text-white">
                SpeechLyt
              </span>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Речевая аналитика контакт-центра на собственном контуре.
              SaaS-простота, on-prem-контроль, белорусская юрисдикция.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-white">
              Продукт
            </h4>
            <ul className="space-y-2 text-sm text-zinc-500 dark:text-zinc-400">
              <li><a href="#offer" className="hover:text-zinc-900 dark:hover:text-white">Что входит</a></li>
              <li><a href="#cases" className="hover:text-zinc-900 dark:hover:text-white">Кейсы</a></li>
              <li><a href="#guarantee" className="hover:text-zinc-900 dark:hover:text-white">Гарантия</a></li>
              <li><a href="#pricing" className="hover:text-zinc-900 dark:hover:text-white">Тарифы</a></li>
              <li><a href="#faq" className="hover:text-zinc-900 dark:hover:text-white">FAQ</a></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-white">
              Компания
            </h4>
            <ul className="space-y-2 text-sm text-zinc-500 dark:text-zinc-400">
              <li><a href="#" className="hover:text-zinc-900 dark:hover:text-white">О нас</a></li>
              <li><a href="#" className="hover:text-zinc-900 dark:hover:text-white">Контакты</a></li>
              <li><a href="#" className="hover:text-zinc-900 dark:hover:text-white">Блог</a></li>
              <li><a href="#" className="hover:text-zinc-900 dark:hover:text-white">Резидент ПВТ</a></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-white">
              Поддержка
            </h4>
            <ul className="space-y-2 text-sm text-zinc-500 dark:text-zinc-400">
              <li><a href="#" className="hover:text-zinc-900 dark:hover:text-white">Документация API</a></li>
              <li><a href="#" className="hover:text-zinc-900 dark:hover:text-white">База знаний</a></li>
              <li><a href="#" className="hover:text-zinc-900 dark:hover:text-white">Статус системы</a></li>
              <li><a href="#" className="hover:text-zinc-900 dark:hover:text-white">ОАЦ-сертификация</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-zinc-200 pt-8 text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400 sm:flex-row">
          <span>&copy; 2026 SpeechLyt. Резидент ПВТ Беларусь. Все права защищены.</span>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-1 transition-colors hover:text-zinc-900 dark:hover:text-white"
          >
            Наверх <ChevronUp className="h-4 w-4" />
          </button>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Landing Page                                                  */
/* ------------------------------------------------------------------ */
export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <LandingHeader />
      <HeroSection />
      <BeforeAfterSection />
      <ValueStackSection />
      <USPSection />
      <MetricsSection />
      <FeaturesSection />
      <ModulesSection />
      <CasesSection />
      <GuaranteeSection />
      <PricingSection />
      <IntegrationsSection />
      <FAQSection />
      <CTASection />
      <LandingFooter />
    </div>
  );
}
