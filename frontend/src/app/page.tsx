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
            { href: "#features", label: "Возможности" },
            { href: "#modules", label: "Модули" },
            { href: "#pricing", label: "Тарифы" },
            { href: "#faq", label: "FAQ" },
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
            <a href="#cta">Запросить демо</a>
          </Button>
        </div>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero Section                                                       */
/* ------------------------------------------------------------------ */
function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 pb-20 pt-32">
      {/* Background grid */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

      {/* Glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2">
        <div className="h-[600px] w-[800px] rounded-full bg-blue-600/10 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1.5 text-sm text-blue-400">
            <Server className="h-3.5 w-3.5" />
            On-prem без OpenAI · Whisper RU/BY · Беларусская юрисдикция
          </div>

          <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight text-white md:text-5xl lg:text-6xl">
            Речевая аналитика
            <br />
            контакт-центра{" "}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              на собственном контуре
            </span>
          </h1>

          <p className="mb-8 text-lg leading-relaxed text-zinc-400 md:text-xl">
            SaaS-простота, on-prem-контроль, договор и оплата в BYN с резидентом ПВТ.
            Анализируем 100 % звонков без OpenAI и Anthropic — на локальных LLM в вашем контуре.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="gap-2 bg-blue-600 text-white hover:bg-blue-700" asChild>
              <a href="#cta">
                Запросить PoC за 7 дней
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
            <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10" asChild>
              <a href="#pricing">Посмотреть тарифы</a>
            </Button>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-zinc-500">
            <span className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-blue-400" /> 14 дней trial без карты
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-blue-400" /> От 990 BYN/мес
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-blue-400" /> ОАЦ-комплаенс
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-blue-400" /> Запуск за 1 день
            </span>
          </div>
        </div>

        {/* Mock preview */}
        <div className="relative mx-auto mt-16 max-w-4xl">
          <div className="absolute -inset-4 rounded-2xl bg-gradient-to-r from-blue-600/20 via-cyan-500/20 to-blue-600/20 blur-xl" />
          <div className="relative rounded-2xl border border-white/10 bg-zinc-900/80 p-2 shadow-2xl backdrop-blur">
            <MockDashboard />
          </div>
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
      title: "Live за 1 день, PoC за неделю",
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
    { value: "95%", label: "Точность Whisper на телефонном RU", icon: Mic },
    { value: "−40%", label: "Среднее время обработки звонка", icon: TrendingUp },
    { value: "+35%", label: "Конверсия продаж на пилотах", icon: Phone },
    { value: "100%", label: "Покрытие звонков анализом", icon: Shield },
    { value: "+28%", label: "Рост удовлетворённости (CSAT)", icon: Users },
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
        "Транскрипция с точностью 95%",
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
              {/* Text */}
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

              {/* Preview */}
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
      cta: "Начать триал",
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
      cta: "Начать 14-дн триал",
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
      cta: "Запросить PoC за 7 дней",
      ctaHref: "#cta",
      featured: false,
      features: [
        "Всё из Growth +",
        "Real-time подсказки оператору",
        "AI-коучинг по истории звонков",
        "Авто-QA (80 % auto-fill)",
        "Неограниченные чек-листы",
        "Кастомные KPI-формулы",
        "SSO (SAML / OIDC)",
        "Приоритетная поддержка 24/7",
        "Выделенный менеджер",
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
            Скидка 20 % при годовой предоплате.
          </p>

          {/* Billing toggle */}
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

                <div className="mb-4">
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                    {t.name}
                  </h3>
                  <p className="mt-1 min-h-[40px] text-xs text-zinc-500 dark:text-zinc-400">
                    {t.tagline}
                  </p>
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

        {/* Pricing footnotes */}
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
                14 дней self-service trial без карты на тарифе Growth (полный функционал, лимит 500 мин).
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
      q: "Как организован 14-дневный trial?",
      a: "Self-service регистрация без банковской карты на тарифе Growth с полным функционалом. Лимит 500 минут анализа. По истечении — переход на платный тариф или экспорт всех данных в CSV/JSON. Никаких автосписаний.",
    },
    {
      q: "Что входит в PoC для Enterprise за 7 дней?",
      a: "Вы загружаете 100-500 реальных звонков вашего контакт-центра. Мы за неделю готовим отчёт: найденные нарушения скрипта (с цитатами), сегментацию по эмоциям, оценку KPI (AHT, FCR, CSAT-прокси), потенциал роста конверсии. Результат — конкретные цифры на ваших данных, а не абстрактные кейсы.",
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
/*  Final CTA                                                          */
/* ------------------------------------------------------------------ */
function CTASection() {
  return (
    <section
      id="cta"
      className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-cyan-600 py-20"
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="relative mx-auto max-w-4xl px-6">
        <div className="text-center">
          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
            Готовы взять под контроль 100 % звонков?
          </h2>
          <p className="mb-10 text-lg text-blue-100">
            Два пути попробовать SpeechLyt — выбирайте, что подходит вам.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Trial card */}
          <div className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur">
            <div className="mb-3 flex items-center gap-2">
              <Rocket className="h-5 w-5 text-white" />
              <span className="text-sm font-semibold uppercase tracking-wider text-blue-100">
                Для SMB и mid-market
              </span>
            </div>
            <h3 className="mb-2 text-2xl font-bold text-white">14 дней trial</h3>
            <p className="mb-4 text-sm text-blue-100">
              Self-service регистрация без банковской карты. Полный функционал тарифа Growth,
              лимит 500 минут анализа.
            </p>
            <Button
              size="lg"
              className="w-full gap-2 bg-white text-blue-700 hover:bg-blue-50"
              asChild
            >
              <Link href="/register">
                Начать триал
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* PoC card */}
          <div className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur">
            <div className="mb-3 flex items-center gap-2">
              <Shield className="h-5 w-5 text-white" />
              <span className="text-sm font-semibold uppercase tracking-wider text-blue-100">
                Для банков, телекома, госов
              </span>
            </div>
            <h3 className="mb-2 text-2xl font-bold text-white">PoC за 7 дней</h3>
            <p className="mb-4 text-sm text-blue-100">
              Загружаем 100-500 ваших звонков, готовим отчёт с реальными нарушениями скрипта
              и потенциалом роста KPI.
            </p>
            <Button
              size="lg"
              className="w-full gap-2 border-2 border-white bg-transparent text-white hover:bg-white hover:text-blue-700"
            >
              Запросить PoC
              <ArrowRight className="h-4 w-4" />
            </Button>
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
          {/* Brand */}
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

          {/* Product */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-white">
              Продукт
            </h4>
            <ul className="space-y-2 text-sm text-zinc-500 dark:text-zinc-400">
              <li><a href="#features" className="hover:text-zinc-900 dark:hover:text-white">Возможности</a></li>
              <li><a href="#modules" className="hover:text-zinc-900 dark:hover:text-white">Модули</a></li>
              <li><a href="#pricing" className="hover:text-zinc-900 dark:hover:text-white">Тарифы</a></li>
              <li><a href="#faq" className="hover:text-zinc-900 dark:hover:text-white">FAQ</a></li>
            </ul>
          </div>

          {/* Company */}
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

          {/* Support */}
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
      <USPSection />
      <MetricsSection />
      <FeaturesSection />
      <ModulesSection />
      <PricingSection />
      <IntegrationsSection />
      <FAQSection />
      <CTASection />
      <LandingFooter />
    </div>
  );
}
