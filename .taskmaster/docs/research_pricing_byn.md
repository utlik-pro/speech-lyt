# Исследование ценообразования и позиционирования SpeechLyt (BYN)

> Дата: 22 апреля 2026 | Валюта: BYN (белорусский рубль) | Рынок: Республика Беларусь

## Ценообразование и позиционирование SpeechLyt (BYN)

### 1. Макроэкономические бенчмарки и валютные курсы

На дату исследования официальные курсы НБРБ:

| Валюта | Курс к BYN | Источник |
|---|---|---|
| USD | 1 USD ≈ 2.83 BYN (17–20.04.2026: 2.8341–2.8669) | [НБРБ](https://www.nbrb.by/statistics/rates/ratesdaily) |
| RUB | 100 RUB ≈ 3.74 BYN (≈ 0.0374 BYN за 1 ₽; 1 BYN ≈ 26.7 ₽) | [myfin.by конвертер](https://myfin.by/converter/rub-byn/100) |
| EUR | 1 EUR ≈ 3.22 BYN | [НБРБ](https://www.nbrb.by/statistics/rates/ratesdaily) |

**Расчётные курсы для прайса** (фиксируем для квартала, чтобы не пересчитывать каждый месяц):
- 1 USD = 2.85 BYN
- 1 ₽ = 0.038 BYN (т.е. 1 000 ₽ ≈ 38 BYN; 100 000 ₽ ≈ 3 800 BYN)

**Соотношение РБ vs РФ цен в SaaS**: исторически белорусский B2B-софт продаётся со «скидкой 15–30 %» от российского прайса в пересчёте по курсу — рынок меньше, бюджеты ниже, но и налоговая нагрузка для резидентов ПВТ существенно ниже (1 % с выручки, [HTP Belarus](https://eor.by/advantages-benefits-htp-belarus/)). Это даёт нам пространство для агрессивной локальной цены при сохранении маржи.

**Бенчмарки смежных SaaS в BYN:**

| Продукт | Минимум BYN/мес | Средний тариф BYN/мес | Источник |
|---|---|---|---|
| Bitrix24 «Базовый» | 35–45 BYN (5 польз.) | 85–106 BYN («Стандарт») | [bitrix24.by/prices](https://www.bitrix24.by/prices/) |
| Bitrix24 «Профессиональный» | от 935 BYN/мес (год) | 1 169 BYN/мес | [bitrix24.by/prices](https://www.bitrix24.by/prices/) |
| amoCRM «Базовый» | ≈ 23 BYN/польз/мес (599 ₽) | ≈ 41 BYN/польз/мес («Расширенный», 1099 ₽) | [bcip.ru](https://bcip.ru/amocrm-tarify-cena-za-polzovanie) |
| amoCRM «Профессиональный» | ≈ 60 BYN/польз/мес (1599 ₽) | — | [bcip.ru](https://bcip.ru/amocrm-tarify-cena-za-polzovanie) |
| Мегаплан (через INSALES.by) | от 21 BYN/мес интеграция | от 380–760 BYN/мес проект | [insales.by/megaplan](https://insales.by/product/megaplan) |
| Usedesk | 380, 760, 1 520 BYN (10/20/40k ₽) | — | [usedesk.ru/pricing](https://usedesk.ru/pricing) |
| Okdesk | от 380 BYN/мес (10k ₽) | — | [okdesk.ru/pricing](https://okdesk.ru/pricing) |

**Вывод:** для белорусского SMB психологический «потолок одного решения» — 500–1 500 BYN/мес. Для сегмента mid-market (50–200 операторов) — 3 000–10 000 BYN/мес. Enterprise on-prem — единичные сделки от 50 000 BYN/год.

---

### 2. Глобальные конкуренты — публичные цены для якорения

| Платформа | Публичная цена | Что входит | Источник |
|---|---|---|---|
| **Observe.AI** | ~$828/агент/год ≈ **2 360 BYN/агент/год** ≈ 197 BYN/агент/мес | Auto QA + real-time agent assist + coaching (AWS Marketplace) | [G2 Observe.AI](https://www.g2.com/products/observe-ai/reviews), [AWS Marketplace](https://aws.amazon.com/marketplace/pp/prodview-lgvu5s7gueesi) |
| **CallMiner Eureka Starter** | Pay-as-you-go (AWS, цена скрыта; стартовый порог $1.5–3k/мес для 10–25 операторов) | Базовая речевая аналитика для Amazon Connect | [CallMiner](https://callminer.com/news/press-releases/callminer-eureka-starter-now-available-on-aws-marketplace-simplifying-speech-analytics-buying-process) |
| **Cresta** | Enterprise-quote (~$1 200–2 500/агент/год), нижняя граница ≈ 3 400 BYN/агент/год | Real-time coaching + auto-scoring | [Cresta AI Platform](https://cresta.com/ai-platform) |
| **Balto** | Per-seat по запросу (~$80–120/агент/мес ≈ 230–340 BYN/мес) | Real-time prompts (лидер) | [balto.ai](https://www.balto.ai/contact-center-ai-software/) |
| **NICE CXone IA** | Enterprise-quote (~$120–180/агент/мес ≈ 340–510 BYN/мес) | Полная WFO-платформа | [NICE Interaction Analytics](https://www.nice.com/products/interaction-analytics) |
| **Verint Speech Analytics** | Enterprise-quote (от $100/агент/мес, обычно $150–250) | Da Vinci AI, GenAI Genie Bot | [Verint Speech](https://www.verint.com/speech-analytics/) |

**Якорение для SpeechLyt:** глобальный mid-market бенчмарк = **200–340 BYN/агент/мес**. Это потолок, под который мы должны заходить с дисконтом 30–50 %, мотивируя клиента «облако в РБ + on-prem без OpenAI/Claude в чувствительном контуре».

---

### 3. Российские конкуренты — детальный прайс (₽ → BYN)

**ASR-движки (only речь-в-текст, без аналитики):**

| Сервис | Цена (₽) | Цена (BYN, ×0.038) | Модель |
|---|---|---|---|
| Yandex SpeechKit (15-сек сегмент) | ~0.20 ₽ за 15 сек ≈ 0.80 ₽/мин | ≈ 0.03 BYN/мин | Pay-per-use, стрим/синх | [Yandex Cloud SpeechKit pricing](https://cloud.yandex.ru/docs/speechkit/pricing) |
| Tinkoff/T-Bank VoiceKit (отложенная) | 0.18 ₽/мин | ≈ 0.007 BYN/мин | Cloud, batch | [VoiceKit tariff](https://software.tbank.ru/docs/voicekit/tariff) |
| Tinkoff VoiceKit (онлайн файл) | 0.48 ₽/мин | ≈ 0.018 BYN/мин | Cloud, sync | [VoiceKit](https://software.tbank.ru/docs/voicekit/tariff) |
| Tinkoff VoiceKit (real-time стрим) | 0.72 ₽/мин | ≈ 0.027 BYN/мин | Real-time | [VoiceKit](https://software.tbank.ru/docs/voicekit/tariff) |
| SaluteSpeech (Sber) пакет | 1 200 ₽ за 1 000 мин = 1.2 ₽/мин | ≈ 0.046 BYN/мин | Pay-per-use | [SaluteSpeech tariffs](https://developers.sber.ru/docs/ru/salutespeech/tariffs/legal-tariffs) |
| MTS Exolve | По запросу, ориентир 1.5–2 ₽/мин | ≈ 0.057–0.076 BYN/мин | Cloud + аналитика | [Exolve speech analytics](https://exolve.ru/products/speech-analytics/) |

**Полноценные платформы речевой аналитики (per-month + per-minute):**

| Платформа | Прайс ₽ | В BYN | Что входит | Источник |
|---|---|---|---|---|
| **Imot.io Small Business** | 53 990 ₽/мес | **≈ 2 050 BYN/мес** | 10 000 мин, GPT-аналитика, CRM, отчёты | [imot.io/tarif](https://imot.io/tarif) |
| **Imot.io Basic** | 123 990 ₽/мес | **≈ 4 700 BYN/мес** | 30 000 мин + auto-уведомления | [imot.io/tarif](https://imot.io/tarif) |
| **Imot.io Standard** | 195 990 ₽/мес | **≈ 7 450 BYN/мес** | 60 000 мин + auto-CRM | [imot.io/tarif](https://imot.io/tarif) |
| **Imot.io Professional** | 260 000 ₽/мес | **≈ 9 880 BYN/мес** | 100 000 мин + расширенные интеграции | [imot.io/tarif](https://imot.io/tarif) |
| **Imot.io Mid-Market** | 399 990 ₽/мес | **≈ 15 200 BYN/мес** | 150 000 мин, enterprise-поддержка | [imot.io/tarif](https://imot.io/tarif) |
| **SalesAI Start** | 17 400 ₽/мес | ≈ 660 BYN/мес | SMB, базовая аналитика | [salesai.ru](https://salesai.ru/) |
| **SalesAI Business** | 79 200 ₽/мес | ≈ 3 010 BYN/мес | Расширенная аналитика | [salesai.ru](https://salesai.ru/) |
| **SalesAI Enterprise (on-prem)** | 159 200 ₽/мес | ≈ 6 050 BYN/мес | On-prem | [salesai.ru](https://salesai.ru/) |
| **Calltouch Predict** | 1 ₽/мин | ≈ 0.038 BYN/мин | Тегирование + расшифровка (тариф «Стандарт») | [calltouch.ru/product/predict](https://www.calltouch.ru/product/predict/) |
| **MANGO OFFICE** | 1 100 ₽/мес + 1 ₽/мин > 10k | ≈ 42 BYN/мес + 0.038 BYN/мин | Базовый AI-анализ | [mango-office.ru](https://www.mango-office.ru/products/virtualnaya_ats/vozmozhnosti/speech-analytics/) |

**Скидки, общепринятые на рынке:** Imot — **25 % при годовой предоплате**, 11–12 % при полугодовой, 4–6 % при квартальной ([imot.io/tarif](https://imot.io/tarif)). SalesAI — фримиум 40 мин/день. SaluteSpeech — фримиум 100 мин/мес для физлиц.

**On-premise лицензии (бенчмарк):**
- 3iTech через Softline — помесячная лицензия on-prem ([store.softline.ru](https://store.softline.ru/3itech/3itech-rechevaya-analitika/))
- Рыночный диапазон on-prem РФ: **700 000 – 4 500 000 ₽ единовременно** = **26 600 – 171 000 BYN** + 18–25 % support/год ([Таймлист](https://timelist.ru/price), [mepulse.ru](https://mepulse.ru/blog/rechevaya-analitika-8-primeneniy-v-biznese-i-sravnenie-cen))
- Кастомные NLU-модели: 80 000 – 300 000 ₽ = **3 040 – 11 400 BYN** разово
- PCI-редакция / деперсонализация: **+10–20 %** к тарифу

**Себестоимость ASR на собственном GPU (Whisper large-v3):**
По данным [SaladCloud benchmark](https://blog.salad.com/whisper-large-v3/): **1 млн часов аудио за $5 110 ≈ $0.005/час ≈ $0.0001/мин ≈ 0.0003 BYN/мин**. На арендованной GPU (RTX 5000 за $0.39/час) — около **$0.013/час аудио ≈ 0.04 BYN/мин**. То есть себестоимость транскрипции для нас в 5–20 раз ниже, чем у Yandex/Tinkoff API, и в ~30–50 раз ниже, чем мы продаём клиенту в составе тарифа. Это даёт целевую gross margin на ASR > 85 %.

---

### 4. Рекомендуемая ценовая сетка SpeechLyt (BYN)

Логика: тариф ≈ **40–50 % дешевле российского аналога Imot** в пересчёте по курсу + явное «локальное преимущество» (on-prem без OpenAI). Под глобальным якорем Observe.AI (197 BYN/агент/мес) — наш Pro выходит ~50 BYN/агент/мес, что в 4× дешевле.

| Тариф | Целевая ЦА | BYN/мес (моно-плата) | Польз. (до) | Минут ASR/мес | SLA | Ключевые фичи |
|---|---|---|---|---|---|---|
| **Starter** | SMB, аутсорс-КЦ, медклиники, 5–15 операторов | **490 BYN/мес** | 15 | 5 000 | 99.5 %, поддержка email | Whisper-транскрипция, диаризация, базовый скрипт-комплаенс (1 чек-лист), AHT/FCR-метрики, дашборд супервайзера, экспорт CSV/JSON |
| **Growth** | Растущие КЦ, банки-челленджеры, ритейл-сети 15–50 операторов | **1 490 BYN/мес** | 50 | 25 000 | 99.7 %, чат + email | Всё из Starter + до 5 чек-листов, эмоции, AI-резюме звонков, CSAT-прокси, алерты в Telegram/Email, REST API, базовая Bitrix24/amoCRM-интеграция |
| **Business** | Крупные банки, телеком, страховщики 50–200 операторов | **3 990 BYN/мес** | 200 | 80 000 | 99.9 %, приоритетная поддержка 24/7 | Всё из Growth + real-time подсказки (Phase 2), AI-коучинг, авто-QA, неограниченные чек-листы, кастомные KPI, SSO (SAML/OIDC), webhooks, выделенный менеджер |
| **Enterprise / On-Prem** | A1, МТС, life:, Беларусбанк, госзаказ, аутсорс-КЦ 200+ | **от 19 900 BYN/мес SaaS** или **от 95 000 BYN one-time + 18 % support/год** | без лимита | без лимита (fair use) или per-GPU | 99.95 %, dedicated CSM + SRE | Всё из Business + on-prem развёртывание, локальные LLM (Llama 3 / Qwen 2.5 / GigaChat), white-label, кастомные модели, выделенный VPC, аудит-логи под комплаенс РБ |

#### Детализация и обоснование

**Starter — 490 BYN/мес:**
- Себестоимость 5 000 мин ASR на собственной GPU ≈ 2 BYN; LLM-резюме (если используем GPT-4o-mini для облачных клиентов) ≈ 50–80 BYN; хостинг + БД ≈ 60 BYN; саппорт амортизирован. **Себестоимость ≈ 150 BYN, маржа ≈ 70 %.**
- Сравнение: Imot SMB-вход — 2 050 BYN/мес. Мы в **4.2× дешевле** при сопоставимом базовом функционале.
- Психологически попадает в «один тариф Bitrix24 Стандарт» = 85 BYN, но за более глубокую функцию — обоснованная премия.

**Growth — 1 490 BYN/мес:**
- 25 000 мин = 417 часов ASR. Себестоимость: ASR 17 BYN + LLM (резюме, эмоции, скрипт) ≈ 250 BYN + хостинг 150 BYN + 5 % CSM = 75 BYN. **Себестоимость ≈ 500 BYN, маржа ≈ 66 %.**
- Сравнение: Imot Basic 4 700 BYN. Мы в **3.2× дешевле**.
- Целевой клиент: контакт-центр на 25 операторов, ~1 000 звонков/день по 2.5 мин = ~25 000 мин/мес — точно в лимит.

**Business — 3 990 BYN/мес:**
- 80 000 мин = 1 333 часа. Себестоимость ASR + LLM ≈ 800 BYN + real-time стрим (стоит дороже) + dedicated infra ≈ 600 BYN + CSM ≈ 200 BYN. **Себестоимость ≈ 1 600 BYN, маржа ≈ 60 %.**
- Сравнение: Imot Standard 7 450 BYN. Мы в **1.9× дешевле** + единственные с real-time на белорусском рынке.
- Якорь Observe.AI: 200 операторов × 197 BYN = 39 400 BYN/мес. Мы в **10× дешевле**.

**Enterprise / On-Prem:**
- SaaS-вариант 19 900 BYN/мес ≈ 240 000 BYN/год — целевой ARR с одного крупного клиента.
- On-prem: 95 000 BYN one-time = ≈ $33 000. Это «дёшево» относительно 3iTech (3.8 млн ₽ = 144 000 BYN на нижней границе), но крепко выше психологического порога одобрения CFO без тендера. + 17 100 BYN/год support (18 %).
- Add-on кастомизации ASR-словаря под отрасль: 5 000–15 000 BYN one-time.

#### Add-ons (общие для всех тарифов)

| Опция | Цена BYN |
|---|---|
| Доп. минуты ASR (сверх лимита) | 0.05 BYN/мин (сегмент 60 сек), при объёме > 100k — 0.03 BYN/мин |
| Доп. пользователь (Growth) | 25 BYN/польз/мес |
| Доп. пользователь (Business) | 18 BYN/польз/мес |
| SSO (SAML/OIDC) | включено в Business+; для Growth — +200 BYN/мес |
| White-label (логотип, домен, цветовая схема) | +500 BYN/мес или 6 000 BYN/год |
| Кастомная интеграция (телефония, CRM, BI) | от 2 500 BYN one-time |
| Setup fee for on-prem | 8 000–15 000 BYN one-time (включает инсталляцию + базовое обучение) |
| Кастомное дообучение ASR/NLU | 5 000–15 000 BYN one-time |
| Аудит-пакет (логи под НБ РБ / банковский комплаенс) | +15 % к тарифу |

---

### 5. Стратегия монетизации

**Модель захода на B2B-рынок РБ:**

1. **14-дневный free trial без карты** на тарифе Growth (полный функционал, лимит 500 мин). Для B2C SaaS это стандарт; для B2B РБ — конкурентное преимущество, т.к. большинство локальных конкурентов работают «по запросу демо». Прецедент: amoCRM 14 дней + 18 дней по запросу ([bcip.ru](https://bcip.ru/amocrm-tarify-cena-za-polzovanie)), SaluteSpeech фримиум 100 мин/мес ([SaluteSpeech](https://developers.sber.ru/docs/ru/salutespeech/tariffs/individual-tariffs)).
2. **Демо + PoC за 7 дней** для Business / Enterprise. Загружаем 100–500 реальных звонков клиента, показываем найденные нарушения скрипта и потенциал KPI-роста — продаёт лучше любой презентации.
3. **Минимальный контракт:**
   - Starter / Growth — помесячно, без обязательств (можно отключить в любой момент).
   - Business — 3 месяца минимум (т.к. ниже маржа на онбординг и кастомизацию).
   - Enterprise / On-Prem — 12 месяцев минимум, оплата квартальная или годовая.
4. **Скидки за предоплату:**
   - Квартальная: **−5 %**
   - Полугодовая: **−12 %**
   - Годовая: **−20 %** (рынок: Imot −25 %, Bitrix24 −22 %, мы чуть скромнее, чтобы не размывать MRR)
5. **One-time setup fee для on-prem: 8 000–15 000 BYN** в зависимости от размера контура. Включает: установку, интеграцию с одной телефонией (Asterisk/3CX/Cisco), одну CRM-интеграцию, базовое обучение 2 групп.
6. **Add-ons как upsell-двигатель:** прозрачные цены за минуты сверх лимита (0.05 BYN/мин в 1.3× нашей себестоимости — здоровая margin), SSO, white-label, кастомные интеграции. Цель — поднять ARPU с 1 490 до 2 500 BYN на клиенте Growth за 6 мес.
7. **Партнёрская программа:** 20 % реферальная комиссия первый год для интеграторов телефонии (Cloud-PBX, Tegrus, ИТ-партнёры ПВТ). Это критично для входа в банки и телеком, где cold-sales не работает.
8. **Локальная биллинг-валюта BYN, договор на белорусское юрлицо** (резидент ПВТ — налог 1 % от выручки + 9 % подоходный для сотрудников, [HTP Belarus](https://eor.by/advantages-benefits-htp-belarus/)). Для крупных клиентов — оплата по счёту с НДС-нюансами через резидентство ПВТ.

---

### 6. Позиционирование

**Конкурентная карта:**

```
                  ДОРОГО (>10 000 BYN/мес)
                          │
      3iTech, ЦРТ ────────┼──────── NICE, Verint, Observe.AI
      (РФ-enterprise)     │         (Global enterprise)
                          │
   Imot (РФ mid)──────────┼─────────────────── SpeechLyt Business
                          │                    (РБ mid + on-prem)
─СЛОЖНО─────────────────  │  ──────────────────── ПРОСТО─
                          │
                          │           SpeechLyt Growth
                          │           (РБ SMB, 14-дн trial)
   Calltouch, MANGO ──────┼─── SalesAI, Rechka.AI, MiaRec
   (РФ цена/минута)       │   (РФ SMB подписка)
                          │
                  ДЕШЕВО (<1 500 BYN/мес)
```

**Против ЦРТ / 3iTech (тяжёлый/дорогой/РФ-enterprise):**
- «Запуск за 1 день, не за 6 месяцев». Готовый SaaS, не мегапроект.
- В 5–10× дешевле on-prem-лицензии.
- Современный стек (Whisper + GPT/локальная LLM), не legacy фонетический ASR 2010-х.
- Нет внешнеполитических рисков для белорусского клиента (договор и оплата в BYN с резидентом ПВТ).

**Против Imot.io (средний/российский):**
- Прямой ценовой проигрыш Imot невозможен на бренде, но мы в **3–4× дешевле** при сопоставимом MVP-функционале.
- **On-prem с локальными LLM (Llama 3 / Qwen 2.5)** — критично для банков и госзаказа РБ, где OpenAI/Claude формально недоступны (санкционные ограничения).
- Договор и поддержка на белорусском юрлице, без валютного контроля при входящих платежах из РБ.
- UX и онбординг под русско-/беларусскоязычного супервайзера, без «российского» брендинга.

#### 4 ключевых УТП для белорусского клиента

1. **«Цена SaaS, контур on-prem»** — единственная платформа на рынке РБ, где можно начать с облака за 490 BYN/мес и за 1 квартал безболезненно мигрировать в собственный контур (банковский комплаенс) без смены вендора и переобучения операторов.
2. **«Без OpenAI-зависимости»** — поддерживаем локальные LLM (Llama 3, Qwen 2.5, GigaChat по API через Sber), что снимает санкционно-комплаенсный риск для банков, госструктур и регулируемых отраслей.
3. **«Whisper-точность на русском, белорусском, mix-language»** — open-source ASR fine-tuned под белорусскую разговорную речь и code-switching рус./бел. (этого нет ни у одного российского вендора).
4. **«Live за 1 день»** — self-service онбординг, готовые шаблоны скриптов под банк/телеком/ритейл/медицину; первые инсайты на 100 загруженных звонках в течение часа. PoC за неделю, а не за квартал.

#### Tagline (одной фразой)

> **«SpeechLyt — речевая аналитика контакт-центра на собственном контуре. SaaS-простота, on-prem-контроль, белорусская юрисдикция.»**

Альтернативы для A/B-теста на лендинге:
- «100 % звонков под контролем — без OpenAI, без российского вендора, без миллионных бюджетов.»
- «Контакт-центр без слепых пятен. От 490 BYN/мес или on-prem за 95 000.»
- «Whisper + AI-комплаенс для белорусского контакт-центра. Старт за 1 день.»

---

### 7. Чек-лист go-to-market по ценам

- [ ] Зафиксировать курс USD = 2.85 BYN, RUB = 0.038 BYN на квартал; пересмотр при изменении ±5 %.
- [ ] Опубликовать прайс **Starter / Growth** на сайте с прозрачной ценой (выделяет нас от 80 % российских конкурентов «по запросу»).
- [ ] **Business / Enterprise** — «от 3 990 BYN/мес» на сайте, точная конфигурация по консультации.
- [ ] Запустить 14-дневный self-service trial на Growth (без карты).
- [ ] Подготовить 3 готовых отраслевых шаблона скриптов: банк (антифрод + UDB-разговор), ритейл (продажа + возражения), медклиника (запись + информированное согласие).
- [ ] Запустить партнёрскую программу с 5 интеграторами телефонии в РБ (Cloud-PBX, Tegrus и аналоги).
- [ ] PoC-пакет «100 звонков клиента → отчёт за 7 дней бесплатно» для топ-30 контакт-центров РБ (А1, МТС, life:, Беларусбанк, Приорбанк, БПС-Сбербанк, Альфа-Банк, Евроопт, Корона, Санта, БелВЭБ, Белагропромбанк, Идея Банк, БСБ, MTBank, страховые «Белгосстрах» и «ТАСК», крупные мед-сети «Лоде», «Экомедсервис»).

---

## Источники

### Курсы валют и макро РБ
- [НБРБ — официальные курсы валют](https://www.nbrb.by/statistics/rates/ratesdaily)
- [myfin.by — конвертер RUB/BYN](https://myfin.by/converter/rub-byn/100)
- [Преимущества ПВТ Беларусь — eor.by](https://eor.by/advantages-benefits-htp-belarus/)
- [investinbelarus.by — Hi-Tech Park](https://investinbelarus.by/en/preferencial-regimes/hi-tech-park/)

### Бенчмарки SaaS в BYN
- [Bitrix24 — тарифы для Беларуси](https://www.bitrix24.by/prices/)
- [bcip.ru — тарифы amoCRM 2026](https://bcip.ru/amocrm-tarify-cena-za-polzovanie)
- [Megaplan через INSALES Belarus](https://insales.by/product/megaplan)
- [Usedesk — pricing](https://usedesk.ru/pricing)
- [Okdesk — pricing](https://okdesk.ru/pricing)

### Глобальные конкуренты
- [Observe.AI — обзор и pricing G2](https://www.g2.com/products/observe-ai/reviews)
- [Observe.AI на AWS Marketplace](https://aws.amazon.com/marketplace/pp/prodview-lgvu5s7gueesi)
- [CallMiner Eureka Starter — AWS Marketplace анонс](https://callminer.com/news/press-releases/callminer-eureka-starter-now-available-on-aws-marketplace-simplifying-speech-analytics-buying-process)
- [Cresta AI Platform](https://cresta.com/ai-platform)
- [Balto AI — Contact Center AI Software](https://www.balto.ai/contact-center-ai-software/)
- [NICE Interaction Analytics](https://www.nice.com/products/interaction-analytics)
- [Verint Speech Analytics](https://www.verint.com/speech-analytics/)

### Российские конкуренты — речевая аналитика
- [Imot.io — публичные тарифы](https://imot.io/tarif)
- [SalesAI — pricing](https://salesai.ru/)
- [SalesAI Blog — обзор рынка 2026](https://blog.salesai.ru/rechevaya-analitika-2026-obzor-rynka)
- [Rechka.AI — pay-per-use](https://rechka.ai/)
- [Calltouch Predict — продукт и цена](https://www.calltouch.ru/product/predict/)
- [MANGO OFFICE — речевая аналитика](https://www.mango-office.ru/products/virtualnaya_ats/vozmozhnosti/speech-analytics/)
- [Spacetel — речевая аналитика от 1.2 ₽/мин](https://spacetel.ru/uslugi/rechevaya-analitika/)
- [3iTech на Softline — лицензия](https://store.softline.ru/3itech/3itech-rechevaya-analitika/)
- [Yandex Cloud SpeechKit — pricing](https://cloud.yandex.ru/docs/speechkit/pricing)
- [T-Bank VoiceKit — tariff](https://software.tbank.ru/docs/voicekit/tariff)
- [SaluteSpeech (Sber) — тарифы для юрлиц](https://developers.sber.ru/docs/ru/salutespeech/tariffs/legal-tariffs)
- [SaluteSpeech — тарифы для физлиц / freemium](https://developers.sber.ru/docs/ru/salutespeech/tariffs/individual-tariffs)
- [МТС Exolve — речевая аналитика](https://exolve.ru/products/speech-analytics/)
- [Тинькофф — корпоративные речевые технологии (vc.ru)](https://vc.ru/services/76336-tinkoff-stal-prodavat-korporativnym-klientam-svoyu-tehnologiyu-sinteza-i-raspoznavaniya-rechi)

### On-prem и self-hosted Whisper
- [Таймлист — лицензии on-prem 1–3 млн ₽/год](https://timelist.ru/price)
- [mepulse.ru — диапазоны цен on-prem 700k–4.5M ₽](https://mepulse.ru/blog/rechevaya-analitika-8-primeneniy-v-biznese-i-sravnenie-cen)
- [SaladCloud — Whisper large-v3 benchmark $5110 за 1M часов](https://blog.salad.com/whisper-large-v3/)
- [Gladia — TCO Whisper self-hosted](https://www.gladia.io/blog/how-much-does-it-really-cost-to-host-open-ai-whisper-ai-transcription)
- [JarvisLabs — GPU pricing для STT](https://jarvislabs.ai/ai-faqs/what-is-the-best-speech-to-text-model-available-and-which-gpu-should-i-deploy-it-on)

### Рынок и зарплаты РБ
- [trud.com — зарплата оператора КЦ в РБ (~764 BYN)](https://by.trud.com/belarus/salary/304581/77849.html)
- [vc.ru — сравнение систем речевой аналитики](https://vc.ru/life/2708829-sravnenie-sistem-rechevoy-analitiki-dlya-koll-tsentrov)
- [Коммерсантъ — рынок диалогового AI 2025](https://www.kommersant.ru/doc/8119268)
