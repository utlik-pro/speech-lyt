"""Seed script for Дана Холдинг (МинскМир) demo project.

Usage: cd backend && .venv/bin/python -m app.scripts.seed_demo
"""

import asyncio
import random
import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy import select

from app.core.database import async_session
from app.models.ai_agent import AIAgent, AIAgentPrompt
from app.models.manager import Manager
from app.models.call import Call, CallDirection, CallStatus
from app.models.emotion import EmotionAnalysis, SentimentType
from app.models.organization import Organization
from app.models.project import Project
from app.models.script import Script, ScriptAnalysis, ScriptStage, ScriptType
from app.models.summary import CallSummary
from app.models.team import Team
from app.models.transcription import Transcription

# ── Constants ──────────────────────────────────────────────────────────────────

DANA_PROJECT_ID = uuid.UUID("00000000-0000-0000-0000-000000000002")
DEFAULT_PROJECT_ID = uuid.UUID("00000000-0000-0000-0000-000000000001")
NUM_CALLS = 2100
NUM_AGENTS = 8
DAYS_RANGE = 90
BATCH_SIZE = 200

MANAGERS_DATA = [
    {"id": uuid.UUID("a0000000-0000-0000-0000-000000000001"), "name": "Иванов Дмитрий", "team": "Продажи", "email": "ivanov@dana.by"},
    {"id": uuid.UUID("a0000000-0000-0000-0000-000000000002"), "name": "Петрова Анна", "team": "Продажи", "email": "petrova@dana.by"},
    {"id": uuid.UUID("a0000000-0000-0000-0000-000000000003"), "name": "Козлов Сергей", "team": "Поддержка", "email": "kozlov@dana.by"},
    {"id": uuid.UUID("a0000000-0000-0000-0000-000000000004"), "name": "Новикова Елена", "team": "Поддержка", "email": "novikova@dana.by"},
    {"id": uuid.UUID("a0000000-0000-0000-0000-000000000005"), "name": "Сидорчук Алексей", "team": "Продажи", "email": "sidorchuk@dana.by"},
    {"id": uuid.UUID("a0000000-0000-0000-0000-000000000006"), "name": "Михайлова Ольга", "team": "Контроль качества", "email": "mikhaylova@dana.by"},
    {"id": uuid.UUID("a0000000-0000-0000-0000-000000000007"), "name": "Жук Павел", "team": "Поддержка", "email": "zhuk@dana.by"},
    {"id": uuid.UUID("a0000000-0000-0000-0000-000000000008"), "name": "Лукашевич Татьяна", "team": "Продажи", "email": "lukashevich@dana.by"},
]
MANAGER_IDS = [a["id"] for a in MANAGERS_DATA]

# ── Тематика: Дана Холдинг / МинскМир ─────────────────────────────────────────

TOPICS = [
    "Консультация по квартирам в МинскМир",
    "Условия рассрочки на квартиру",
    "Ипотечное кредитование",
    "Запись на просмотр квартиры",
    "Вопрос по договору ДДУ",
    "Жалоба на сроки сдачи дома",
    "Паркинг и кладовые помещения",
    "Приёмка квартиры",
    "Отделка под ключ",
    "Перепланировка квартиры",
    "Вопрос по коммунальным платежам",
    "Инфраструктура района МинскМир",
    "Детский сад и школа в МинскМир",
    "Переуступка прав по ДДУ",
    "Акции и специальные предложения",
    "Коммерческая недвижимость МинскМир",
    "Обмен квартиры",
    "Гарантийное обслуживание",
]

CATEGORIES = [
    "sales",
    "consultation",
    "complaint",
    "service",
    "mortgage",
    "inspection",
    "contract",
    "infrastructure",
]

OUTCOMES = ["resolved", "unresolved", "escalated", "callback"]
OUTCOME_WEIGHTS = [0.55, 0.20, 0.15, 0.10]

TAGS_POOL = [
    "МинскМир",
    "рассрочка",
    "ипотека",
    "просмотр",
    "ДДУ",
    "приёмка",
    "отделка",
    "VIP-клиент",
    "повторное обращение",
    "первый звонок",
    "жалоба",
    "акция",
    "паркинг",
    "коммерческая",
    "обмен",
]

SUMMARY_TEMPLATES = [
    "Клиент обратился по вопросу: {topic}. Оператор {action}.",
    "Звонок по теме «{topic}». {action}. Клиент {result}.",
    "Обращение касалось: {topic}. Агент провёл консультацию и {action}.",
    "Входящий звонок — {topic}. Менеджер {action}. {result}.",
]

ACTIONS = [
    "предоставил подробную консультацию по планировкам",
    "рассчитал стоимость квартиры с рассрочкой",
    "записал клиента на просмотр квартиры",
    "объяснил условия договора долевого участия",
    "помог подобрать подходящую квартиру",
    "перенаправил обращение в отдел гарантийного обслуживания",
    "оформил заявку на ипотечное кредитование",
    "зафиксировал жалобу и передал руководству",
    "рассказал о текущих акциях и скидках",
    "предоставил информацию об инфраструктуре МинскМир",
]

RESULTS = [
    "Клиент записался на просмотр",
    "Клиент попросил перезвонить",
    "Клиент согласился с условиями",
    "Клиент выразил недовольство сроками",
    "Клиент оформил бронь квартиры",
    "Клиент отказался от предложения",
    "Клиент запросил дополнительные документы",
]

PROBLEMS = [
    "Задержка сдачи дома на 3 месяца",
    "Несоответствие планировки квартиры проекту",
    "Некорректный расчёт рассрочки",
    "Отсутствие парковочного места",
    "Дефекты при приёмке квартиры",
    "Долгое ожидание ответа от отдела продаж",
    "Проблемы с документами по ДДУ",
    None,
    None,
    None,
]

SOLUTIONS = [
    "Предоставлен актуальный график сдачи дома",
    "Менеджер согласовал индивидуальные условия рассрочки",
    "Оформлена заявка на устранение дефектов",
    "Предоставлена скидка в качестве компенсации",
    "Направлены обновлённые документы на email",
    "Назначена повторная приёмка квартиры",
    None,
    None,
]

PHONE_PREFIXES = ["+37529", "+37533", "+37544", "+37525"]

NEXT_STEPS_POOL = [
    "Перезвонить клиенту через 2 дня",
    "Отправить планировки на email",
    "Подготовить договор ДДУ к подписанию",
    "Назначить просмотр на следующую неделю",
    "Передать жалобу в гарантийный отдел",
    None,
    None,
    None,
]

# ── Скрипты для Дана Холдинг ──────────────────────────────────────────────────

SCRIPTS_DATA = [
    {
        "name": "Входящий звонок — консультация по квартирам",
        "type": ScriptType.SUPPORT,
        "description": "Скрипт для обработки входящих звонков с вопросами о квартирах в ЖК МинскМир",
        "stages": [
            {"name": "Приветствие", "required_phrases": ["Добрый день", "Дана Холдинг", "Чем могу помочь"], "forbidden_words": ["алло", "да говорите"], "is_required": True, "max_duration_seconds": 30},
            {"name": "Выяснение потребностей", "required_phrases": ["какую квартиру", "сколько комнат", "бюджет"], "forbidden_words": [], "is_required": True, "max_duration_seconds": 120},
            {"name": "Презентация объекта", "required_phrases": ["МинскМир", "планировка", "этаж"], "forbidden_words": ["не знаю"], "is_required": True, "max_duration_seconds": 180},
            {"name": "Условия покупки", "required_phrases": ["рассрочка", "ипотека", "стоимость"], "forbidden_words": ["дорого"], "is_required": True, "max_duration_seconds": 120},
            {"name": "Запись на просмотр", "required_phrases": ["просмотр", "удобное время"], "forbidden_words": [], "is_required": False, "max_duration_seconds": 60},
            {"name": "Завершение", "required_phrases": ["Спасибо за звонок", "Хорошего дня"], "forbidden_words": [], "is_required": True, "max_duration_seconds": 30},
        ],
    },
    {
        "name": "Исходящий звонок — продажа квартир",
        "type": ScriptType.SALES,
        "description": "Скрипт для исходящих звонков потенциальным покупателям квартир",
        "stages": [
            {"name": "Представление", "required_phrases": ["Добрый день", "Дана Холдинг", "жилой комплекс МинскМир"], "forbidden_words": [], "is_required": True, "max_duration_seconds": 20},
            {"name": "Выявление интереса", "required_phrases": ["рассматриваете покупку", "какой район"], "forbidden_words": ["купите", "вы должны"], "is_required": True, "max_duration_seconds": 90},
            {"name": "Презентация преимуществ", "required_phrases": ["инфраструктура", "рядом метро", "парк"], "forbidden_words": [], "is_required": True, "max_duration_seconds": 120},
            {"name": "Работа с возражениями", "required_phrases": ["понимаю", "давайте рассмотрим"], "forbidden_words": ["невозможно"], "is_required": False, "max_duration_seconds": 90},
            {"name": "Приглашение на просмотр", "required_phrases": ["приглашаю", "посмотреть квартиру"], "forbidden_words": [], "is_required": True, "max_duration_seconds": 60},
            {"name": "Прощание", "required_phrases": ["Спасибо за ваше время", "Всего доброго"], "forbidden_words": [], "is_required": True, "max_duration_seconds": 15},
        ],
    },
    {
        "name": "Обработка жалоб жильцов",
        "type": ScriptType.INBOUND,
        "description": "Скрипт для работы с жалобами жильцов комплекса МинскМир",
        "stages": [
            {"name": "Приветствие", "required_phrases": ["Добрый день", "Дана Холдинг", "служба качества"], "forbidden_words": [], "is_required": True, "max_duration_seconds": 20},
            {"name": "Выслушивание жалобы", "required_phrases": ["понимаю", "сожалею"], "forbidden_words": ["успокойтесь", "вы не правы", "это не наша проблема"], "is_required": True, "max_duration_seconds": 180},
            {"name": "Уточнение деталей", "required_phrases": ["номер дома", "номер квартиры", "когда это произошло"], "forbidden_words": [], "is_required": True, "max_duration_seconds": 120},
            {"name": "Решение", "required_phrases": ["мы направим", "специалист свяжется"], "forbidden_words": ["ничего не могу сделать"], "is_required": True, "max_duration_seconds": 120},
            {"name": "Завершение", "required_phrases": ["благодарю за обращение", "обязательно решим"], "forbidden_words": [], "is_required": True, "max_duration_seconds": 30},
        ],
    },
    {
        "name": "NPS-опрос жильцов МинскМир",
        "type": ScriptType.OUTBOUND,
        "description": "Скрипт для сбора обратной связи и оценки удовлетворённости жильцов",
        "stages": [
            {"name": "Приветствие", "required_phrases": ["Здравствуйте", "Дана Холдинг", "опрос удовлетворённости"], "forbidden_words": [], "is_required": True, "max_duration_seconds": 30},
            {"name": "Вопрос NPS", "required_phrases": ["от 0 до 10", "порекомендовали бы"], "forbidden_words": [], "is_required": True, "max_duration_seconds": 45},
            {"name": "Уточняющие вопросы", "required_phrases": ["что можем улучшить", "качество обслуживания"], "forbidden_words": [], "is_required": False, "max_duration_seconds": 120},
            {"name": "Благодарность", "required_phrases": ["Спасибо за ваше время", "ваше мнение важно"], "forbidden_words": [], "is_required": True, "max_duration_seconds": 15},
        ],
    },
]

# ── Фразы для транскрипции ────────────────────────────────────────────────────

AGENT_PHRASES = [
    "Добрый день, вас приветствует компания Дана Холдинг, жилой комплекс МинскМир.",
    "Чем могу вам помочь?",
    "Одну минуту, сейчас проверю наличие квартир.",
    "В данный момент доступны квартиры в домах третьей и четвёртой очереди.",
    "Стоимость однокомнатной квартиры начинается от 85 тысяч рублей.",
    "Мы предлагаем рассрочку до 5 лет без процентов.",
    "Также доступно ипотечное кредитование через банки-партнёры.",
    "Давайте запишу вас на просмотр. Когда вам удобно?",
    "Спасибо за звонок, хорошего дня!",
    "Понимаю вашу ситуацию, мы обязательно разберёмся.",
    "Ваша жалоба зарегистрирована, специалист свяжется с вами в течение суток.",
    "Район МинскМир — это современная инфраструктура: школы, детские сады, магазины.",
    "Сдача вашего дома запланирована на третий квартал текущего года.",
    "Приёмка квартиры будет проходить по записи, я могу вас записать.",
    "Мы предоставляем услугу отделки под ключ по фиксированной цене.",
]

CLIENT_PHRASES = [
    "Здравствуйте, я хотел бы узнать о квартирах в МинскМир.",
    "Какие квартиры сейчас доступны?",
    "Сколько стоит двухкомнатная квартира?",
    "Есть ли рассрочка? На какой срок?",
    "Какие банки предоставляют ипотеку на ваши квартиры?",
    "Я хотел бы записаться на просмотр квартиры.",
    "Когда будет сдан мой дом? Уже третий месяц задержка.",
    "У меня проблема при приёмке — трещина на стене.",
    "Можно ли сделать перепланировку?",
    "Какая инфраструктура есть рядом?",
    "Хорошо, спасибо за информацию.",
    "Это неприемлемо, я буду жаловаться.",
    "Давайте оформим бронь на эту квартиру.",
    "Мне нужен паркинг, есть свободные места?",
    "Я уже звонил на прошлой неделе, проблема не решена.",
]

ENTITIES_NAMES = [
    "Иванов И.П.", "Петрова А.С.", "Козлов Д.В.", "Новикова Е.М.",
    "Сидорчук В.Н.", "Михайлова О.А.", "Жук П.И.", "Лукашенко Т.Г.",
]

# ── Helpers ────────────────────────────────────────────────────────────────────


def _random_phone():
    prefix = random.choice(PHONE_PREFIXES)
    return prefix + "".join([str(random.randint(0, 9)) for _ in range(7)])


def _random_datetime_in_range():
    now = datetime.now(timezone.utc)
    delta = timedelta(seconds=random.randint(0, DAYS_RANGE * 86400))
    return now - delta


def _generate_emotion_timeline(duration: float):
    sentiments = ["positive", "neutral", "negative"]
    num_points = random.randint(5, 15)
    times = sorted([round(random.uniform(0, duration), 1) for _ in range(num_points)])
    return [
        {"time": t, "sentiment": random.choice(sentiments), "intensity": round(random.uniform(0.3, 1.0), 2)}
        for t in times
    ]


def _generate_critical_moments(duration: float):
    types = ["escalation", "frustration", "satisfaction", "confusion", "resolution"]
    descriptions = [
        "Клиент повысил голос из-за задержки сдачи",
        "Оператор не смог ответить на вопрос по ДДУ",
        "Клиент выразил благодарность за подробную консультацию",
        "Длительная пауза — клиент обсуждает с семьёй",
        "Успешное бронирование квартиры",
        "Клиент угрожает обратиться в СМИ",
        "Клиент доволен условиями рассрочки",
        "Клиент сравнивает с конкурентами",
    ]
    num = random.choices([0, 1, 2, 3], weights=[0.3, 0.35, 0.25, 0.1])[0]
    return [
        {"time": round(random.uniform(0, duration), 1), "type": random.choice(types), "description": random.choice(descriptions)}
        for _ in range(num)
    ]


def _generate_segments(duration: float):
    segments = []
    t = 0.0
    idx = 0
    while t < duration:
        speaker = "agent" if idx % 2 == 0 else "client"
        phrase = random.choice(AGENT_PHRASES if speaker == "agent" else CLIENT_PHRASES)
        seg_dur = random.uniform(2.0, 15.0)
        end = min(t + seg_dur, duration)
        segments.append({
            "speaker": speaker,
            "text": phrase,
            "start_time": round(t, 2),
            "end_time": round(end, 2),
            "confidence": round(random.uniform(0.85, 0.99), 3),
        })
        t = end + random.uniform(0.2, 1.5)
        idx += 1
    return segments


def _generate_script_analysis(call_id, script_id, stages_info):
    stage_results = []
    violations = []
    scores = []
    for si in stages_info:
        score = round(random.uniform(40, 100), 1)
        passed = score >= 60
        scores.append(score)
        matched = random.sample(si["required_phrases"], k=min(len(si["required_phrases"]), random.randint(0, len(si["required_phrases"]))))
        missing = [p for p in si["required_phrases"] if p not in matched]
        found_forbidden = random.sample(si["forbidden_words"], k=min(len(si["forbidden_words"]), random.randint(0, 1)))
        stage_results.append({
            "stage_id": str(si["id"]),
            "stage_name": si["name"],
            "passed": passed,
            "score": score,
            "matched_phrases": matched,
            "missing_phrases": missing,
            "found_forbidden_words": found_forbidden,
            "notes": "",
        })
        if missing:
            violations.append({"stage_name": si["name"], "type": "missing_phrase", "description": f"Пропущены фразы: {', '.join(missing)}", "severity": "medium"})
        if found_forbidden:
            violations.append({"stage_name": si["name"], "type": "forbidden_word", "description": f"Запрещённые слова: {', '.join(found_forbidden)}", "severity": "high"})
    overall = round(sum(scores) / len(scores), 1) if scores else 0.0
    return ScriptAnalysis(call_id=call_id, script_id=script_id, overall_score=overall, stage_results=stage_results, violations=violations)


# ── Main seed ──────────────────────────────────────────────────────────────────


async def seed():
    async with async_session() as db:
        # Check if we need to re-seed (delete old data if exists)
        existing = await db.execute(select(Project).where(Project.id == DANA_PROJECT_ID))
        if existing.scalar_one_or_none():
            print("Дана Холдинг exists — deleting old data for re-seed...")
            # Delete in order respecting FK constraints
            from sqlalchemy import delete
            old_call_ids = select(Call.id).where(Call.organization_id == DANA_PROJECT_ID)
            await db.execute(delete(ScriptAnalysis).where(ScriptAnalysis.call_id.in_(old_call_ids)))
            await db.execute(delete(CallSummary).where(CallSummary.call_id.in_(old_call_ids)))
            await db.execute(delete(EmotionAnalysis).where(EmotionAnalysis.call_id.in_(old_call_ids)))
            await db.execute(delete(Transcription).where(Transcription.call_id.in_(old_call_ids)))
            await db.execute(delete(Call).where(Call.organization_id == DANA_PROJECT_ID))
            old_script_ids = select(Script.id).where(Script.organization_id == DANA_PROJECT_ID)
            await db.execute(delete(ScriptStage).where(ScriptStage.script_id.in_(old_script_ids)))
            await db.execute(delete(Script).where(Script.organization_id == DANA_PROJECT_ID))
            await db.execute(delete(Manager).where(Manager.organization_id == DANA_PROJECT_ID))
            await db.execute(delete(Team).where(Team.organization_id == DANA_PROJECT_ID))
            await db.flush()
            print("  Old data deleted.")

        # Create Default project
        existing_default = await db.execute(select(Project).where(Project.id == DEFAULT_PROJECT_ID))
        if not existing_default.scalar_one_or_none():
            db.add(Project(id=DEFAULT_PROJECT_ID, name="Default", description="Default project", color="#3B82F6"))
            await db.flush()
            print("Created Default project")

        # Create Organization (required for FK constraints)
        existing_org = await db.execute(select(Organization).where(Organization.id == DANA_PROJECT_ID))
        if not existing_org.scalar_one_or_none():
            org = Organization(
                id=DANA_PROJECT_ID,
                name="Дана Холдинг",
                plan="pro",
                settings={"timezone": "Europe/Minsk", "language": "ru"},
            )
            db.add(org)
            await db.flush()
            print(f"Created organization: {org.name}")

        # Create Дана Холдинг project (if not exists)
        existing_proj = await db.execute(select(Project).where(Project.id == DANA_PROJECT_ID))
        if not existing_proj.scalar_one_or_none():
            project = Project(
                id=DANA_PROJECT_ID,
                name="Дана Холдинг",
                description="Колл-центр жилого комплекса МинскМир — продажа квартир, консультации, обслуживание",
                color="#6366F1",
            )
            db.add(project)
            await db.flush()
            print(f"Created project: {project.name}")
        else:
            print("Project Дана Холдинг already exists, keeping it.")

        # Create teams
        team_names = sorted(set(a["team"] for a in MANAGERS_DATA))
        teams_map = {}
        for team_name in team_names:
            team = Team(
                organization_id=DANA_PROJECT_ID,
                name=team_name,
            )
            db.add(team)
            await db.flush()
            teams_map[team_name] = team.id
        print(f"Created {len(teams_map)} teams: {', '.join(team_names)}")

        # Create managers
        for md in MANAGERS_DATA:
            manager = Manager(
                id=md["id"],
                organization_id=DANA_PROJECT_ID,
                name=md["name"],
                email=md["email"],
                team=md["team"],
                team_id=teams_map.get(md["team"]),
                is_active=True,
            )
            db.add(manager)
        await db.flush()
        print(f"Created {len(MANAGERS_DATA)} managers")

        # Create scripts
        scripts_with_stages = []
        for sd in SCRIPTS_DATA:
            script = Script(
                organization_id=DANA_PROJECT_ID,
                name=sd["name"],
                type=sd["type"],
                description=sd["description"],
                is_active=True,
            )
            db.add(script)
            await db.flush()
            stage_infos = []
            for i, st in enumerate(sd["stages"]):
                stage = ScriptStage(
                    script_id=script.id, order=i, name=st["name"],
                    required_phrases=st["required_phrases"],
                    forbidden_words=st["forbidden_words"],
                    is_required=st["is_required"],
                    max_duration_seconds=st["max_duration_seconds"],
                )
                db.add(stage)
                await db.flush()
                stage_infos.append({"id": stage.id, "name": stage.name, "required_phrases": stage.required_phrases, "forbidden_words": stage.forbidden_words})
            scripts_with_stages.append((script, stage_infos))
            print(f"  Script: {script.name} ({len(stage_infos)} stages)")

        # Generate calls in batches
        batch_calls = []
        batch_trans = []
        batch_emot = []
        batch_summ = []
        batch_sa = []

        sentiments = list(SentimentType)
        s_weights = [0.35, 0.40, 0.25]
        agent_s_weights = [0.50, 0.40, 0.10]

        for i in range(NUM_CALLS):
            call_id = uuid.uuid4()
            created_at = _random_datetime_in_range()
            is_completed = random.random() < 0.92
            status = CallStatus.COMPLETED if is_completed else CallStatus.FAILED
            direction = random.choice([CallDirection.INBOUND, CallDirection.OUTBOUND])
            duration = round(random.uniform(60, 900), 1) if is_completed else None

            call = Call(
                id=call_id,
                organization_id=DANA_PROJECT_ID,
                agent_id=random.choice(MANAGER_IDS),
                external_id=f"DANA-{i + 1:05d}",
                audio_url=f"s3://speechlyt-audio/demo/{call_id}.wav",
                original_filename=f"call_{created_at.strftime('%Y%m%d_%H%M%S')}_{i + 1}.wav",
                audio_format="wav",
                file_size_bytes=random.randint(500_000, 15_000_000),
                duration_seconds=duration,
                sample_rate=16000,
                channels=1,
                direction=direction,
                phone_number=_random_phone(),
                status=status,
                error_message="ASR processing timeout" if status == CallStatus.FAILED else None,
            )
            call.created_at = created_at
            call.updated_at = created_at + timedelta(minutes=random.randint(1, 10))
            batch_calls.append(call)

            if is_completed and duration:
                segments = _generate_segments(duration)
                full_text = " ".join(s["text"] for s in segments)
                batch_trans.append(Transcription(
                    call_id=call_id, full_text=full_text, language="ru",
                    segments=segments, asr_provider="openai-whisper", asr_model="whisper-1",
                ))

                batch_emot.append(EmotionAnalysis(
                    call_id=call_id,
                    overall_sentiment=random.choices(sentiments, weights=s_weights)[0],
                    agent_sentiment=random.choices(sentiments, weights=agent_s_weights)[0],
                    client_sentiment=random.choices(sentiments, weights=s_weights)[0],
                    emotion_timeline=_generate_emotion_timeline(duration),
                    critical_moments=_generate_critical_moments(duration),
                ))

                topic = random.choice(TOPICS)
                action = random.choice(ACTIONS)
                result = random.choice(RESULTS)
                template = random.choice(SUMMARY_TEMPLATES)
                batch_summ.append(CallSummary(
                    call_id=call_id,
                    short_summary=template.format(topic=topic, action=action, result=result),
                    topic=topic,
                    problem=random.choice(PROBLEMS),
                    solution=random.choice(SOLUTIONS),
                    outcome=random.choices(OUTCOMES, weights=OUTCOME_WEIGHTS)[0],
                    next_steps=random.choice(NEXT_STEPS_POOL),
                    entities=[{"name": "Клиент", "type": "person", "value": random.choice(ENTITIES_NAMES)}],
                    tags=random.sample(TAGS_POOL, k=random.randint(1, 4)),
                    category=random.choice(CATEGORIES),
                ))

                if random.random() < 0.70:
                    script, si = random.choice(scripts_with_stages)
                    batch_sa.append(_generate_script_analysis(call_id, script.id, si))

            # Flush batch
            if (i + 1) % BATCH_SIZE == 0 or i == NUM_CALLS - 1:
                db.add_all(batch_calls)
                db.add_all(batch_trans)
                db.add_all(batch_emot)
                db.add_all(batch_summ)
                db.add_all(batch_sa)
                await db.flush()
                print(f"  Batch {(i + 1) // BATCH_SIZE}: {len(batch_calls)} calls, {len(batch_trans)} transcriptions, "
                      f"{len(batch_emot)} emotions, {len(batch_summ)} summaries, {len(batch_sa)} script analyses")
                batch_calls.clear()
                batch_trans.clear()
                batch_emot.clear()
                batch_summ.clear()
                batch_sa.clear()

        # ── AI Agents ─────────────────────────────────────────────────────────
        from sqlalchemy import delete as sa_delete
        from app.models.ai_agent import AIAgent, AIAgentPrompt

        # Clean up old AI agents for this org
        old_agent_ids = select(AIAgent.id).where(AIAgent.organization_id == DANA_PROJECT_ID)
        await db.execute(sa_delete(AIAgentPrompt).where(AIAgentPrompt.ai_agent_id.in_(old_agent_ids)))
        await db.execute(sa_delete(AIAgent).where(AIAgent.organization_id == DANA_PROJECT_ID))
        await db.flush()

        # 1. Quality Analyzer agent
        analyzer = AIAgent(
            organization_id=DANA_PROJECT_ID,
            name="Анализатор качества",
            description="Автоматический анализ звонков: эмоции, саммари, соблюдение скрипта",
            agent_type="analyzer",
            model_name="gpt-4o-mini",
            temperature=0.3,
            max_tokens=2048,
            is_active=True,
            pipeline_steps=[
                {"step_type": "emotion_analysis", "enabled": True, "order": 1, "config": {}},
                {"step_type": "summary", "enabled": True, "order": 2, "config": {}},
                {"step_type": "script_compliance", "enabled": True, "order": 3, "config": {}},
            ],
        )
        db.add(analyzer)
        await db.flush()
        print(f"Created AI agent: {analyzer.name}")

        # 2. Manager Coach agent
        coach = AIAgent(
            organization_id=DANA_PROJECT_ID,
            name="Коуч менеджеров",
            description="Анализ работы менеджеров, выявление зон роста, рекомендации по обучению",
            agent_type="coach",
            model_name="gpt-4o-mini",
            temperature=0.4,
            max_tokens=3000,
            is_active=True,
            pipeline_steps=[
                {"step_type": "coaching", "enabled": True, "order": 1, "config": {"period_days": 30}},
            ],
        )
        db.add(coach)
        await db.flush()
        print(f"Created AI agent: {coach.name}")

        await db.commit()
        print(f"\nSeed complete! {NUM_CALLS} calls + 2 AI agents for Дана Холдинг (МинскМир).")


if __name__ == "__main__":
    asyncio.run(seed())
