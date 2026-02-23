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
            { href: "#metrics", label: "Метрики" },
            { href: "#modules", label: "Модули" },
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
            <Zap className="h-3.5 w-3.5" />
            AI-powered Speech Analytics
          </div>

          <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight text-white md:text-5xl lg:text-6xl">
            AI-платформа речевой
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              аналитики
            </span>{" "}
            для контакт-центров
          </h1>

          <p className="mb-8 text-lg leading-relaxed text-zinc-400 md:text-xl">
            Анализируйте 100% звонков в реальном времени. Повышайте качество
            обслуживания, контролируйте скрипты и обучайте операторов с помощью
            искусственного интеллекта.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="gap-2 bg-blue-600 text-white hover:bg-blue-700" asChild>
              <a href="#cta">
                Запросить демо
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
            <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10" asChild>
              <Link href="/login">Войти в систему</Link>
            </Button>
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
/*  Key Metrics Section                                                */
/* ------------------------------------------------------------------ */
function MetricsSection() {
  const metrics = [
    { value: "95%", label: "Точность распознавания речи", icon: Mic },
    { value: "-40%", label: "Среднее время обработки", icon: TrendingUp },
    { value: "+35%", label: "Конверсия продаж", icon: Phone },
    { value: "100%", label: "Покрытие звонков анализом", icon: Shield },
    { value: "+28%", label: "Рост удовлетворённости (CSAT)", icon: Users },
    { value: "3x", label: "Ускорение обучения операторов", icon: Zap },
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
        "Автоматическая транскрипция, определение тональности, категоризация тем и выявление ключевых фраз с помощью нейросети.",
    },
    {
      icon: BarChart3,
      title: "KPI-дашборд",
      description:
        "Мониторинг ключевых метрик в реальном времени: AHT, FCR, CSAT, NPS. Тренды, тепловые карты и облака слов.",
    },
    {
      icon: FileText,
      title: "Скрипты и комплаенс",
      description:
        "Контроль соблюдения скриптов продаж и обслуживания. Автоматическая оценка прохождения каждого этапа.",
    },
    {
      icon: Shield,
      title: "QA-оценки качества",
      description:
        "Настраиваемые чек-листы для оценки звонков. Автоматическое заполнение на основе AI-анализа.",
    },
    {
      icon: Users,
      title: "Рейтинг операторов",
      description:
        "Лидерборд по ключевым показателям. Персональная аналитика, динамика роста и зоны для развития.",
    },
    {
      icon: Bell,
      title: "Алерты и мониторинг",
      description:
        "Настраиваемые правила оповещений по любым метрикам. Моментальные уведомления о критических отклонениях.",
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
/*  Integrations                                                       */
/* ------------------------------------------------------------------ */
function IntegrationsSection() {
  const integrations = [
    { icon: Globe, label: "REST API", desc: "Полноценный API для интеграции" },
    { icon: Webhook, label: "Webhooks", desc: "Уведомления в реальном времени" },
    { icon: KeyRound, label: "API-ключи", desc: "Безопасная авторизация" },
    { icon: Phone, label: "CRM", desc: "Интеграция с CRM-системами" },
  ];

  return (
    <section className="bg-zinc-50 py-20 dark:bg-zinc-900">
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
/*  FAQ Section                                                        */
/* ------------------------------------------------------------------ */
function FAQSection() {
  const items = [
    {
      q: "Какие форматы аудио поддерживаются?",
      a: "SpeechLyt поддерживает WAV, MP3, OGG и FLAC. Максимальный размер файла — 500 МБ. Поддерживается как пакетная загрузка, так и потоковая передача через API.",
    },
    {
      q: "Как работает AI-анализ звонков?",
      a: "Система автоматически транскрибирует аудио, определяет тональность (позитивная/нейтральная/негативная), категоризирует тему разговора, оценивает соблюдение скрипта и выделяет ключевые фразы.",
    },
    {
      q: "Можно ли настроить собственные метрики и KPI?",
      a: "Да, платформа поддерживает настраиваемые метрики, пороговые значения и правила алертов. Вы можете задать свои KPI и получать уведомления при отклонении от нормы.",
    },
    {
      q: "Поддерживается ли интеграция с нашей CRM?",
      a: "SpeechLyt предоставляет REST API и Webhooks для интеграции с любыми внешними системами. Доступна документация API и готовые примеры для популярных CRM.",
    },
    {
      q: "Как организована безопасность данных?",
      a: "Все данные шифруются при передаче и хранении. Используется JWT-авторизация, ролевая модель доступа и API-ключи. Аудит-лог фиксирует все действия в системе.",
    },
    {
      q: "Сколько операторов можно подключить?",
      a: "Ограничений на количество операторов нет. Платформа масштабируется горизонтально и поддерживает работу с несколькими проектами и командами одновременно.",
    },
  ];

  return (
    <section id="faq" className="bg-white py-20 dark:bg-zinc-950">
      <div className="mx-auto max-w-3xl px-6">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-zinc-900 dark:text-white">
            Часто задаваемые вопросы
          </h2>
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

      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
          Готовы повысить качество обслуживания?
        </h2>
        <p className="mb-8 text-lg text-blue-100">
          Начните анализировать 100% звонков уже сегодня. Настройка занимает
          менее 15 минут.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button
            size="lg"
            className="gap-2 bg-white text-blue-700 hover:bg-blue-50"
          >
            Запросить демо
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button
            size="lg"
            className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-700"
            asChild
          >
            <Link href="/register">Попробовать бесплатно</Link>
          </Button>
        </div>
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
              AI-платформа речевой аналитики для контакт-центров
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
              <li><a href="#metrics" className="hover:text-zinc-900 dark:hover:text-white">Результаты</a></li>
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
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-zinc-200 pt-8 text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400 sm:flex-row">
          <span>&copy; 2026 SpeechLyt. Все права защищены.</span>
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
      <MetricsSection />
      <FeaturesSection />
      <ModulesSection />
      <IntegrationsSection />
      <FAQSection />
      <CTASection />
      <LandingFooter />
    </div>
  );
}
