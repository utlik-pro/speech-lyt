"""Seed script for QA Scorecards, QA Evaluations, and Coaching Insights.

Usage: cd backend && .venv/bin/python -m app.scripts.seed_qa_coaching
"""

import asyncio
import random
import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy import delete, select, func

from app.core.database import async_session
from app.models.ai_agent import AIAgent
from app.models.call import Call, CallStatus
from app.models.coaching import CoachingInsight
from app.models.emotion import EmotionAnalysis
from app.models.manager import Manager
from app.models.qa import QAEvaluation, QAScorecard
from app.models.script import ScriptAnalysis
from app.models.summary import CallSummary

DANA_PROJECT_ID = uuid.UUID("00000000-0000-0000-0000-000000000002")
BATCH_SIZE = 200

# ── QA Scorecards ────────────────────────────────────────────────────────────

SCORECARDS = [
    {
        "name": "Стандарт качества — Входящие звонки",
        "description": "Основная карта оценки качества для входящих звонков колл-центра Дана Холдинг",
        "criteria": [
            {"id": "greeting", "name": "Приветствие", "category": "Скрипт", "weight": 10, "description": "Оператор поздоровался, представился, назвал компанию", "auto_source": "script_analysis"},
            {"id": "needs_discovery", "name": "Выяснение потребностей", "category": "Скрипт", "weight": 15, "description": "Оператор задал уточняющие вопросы, выяснил запрос клиента", "auto_source": "script_analysis"},
            {"id": "presentation", "name": "Презентация продукта", "category": "Скрипт", "weight": 15, "description": "Оператор предложил подходящий вариант, описал преимущества", "auto_source": "script_analysis"},
            {"id": "agent_tone", "name": "Тон оператора", "category": "Коммуникация", "weight": 10, "description": "Оператор вежлив, дружелюбен, проявляет эмпатию", "auto_source": "emotion"},
            {"id": "client_satisfaction", "name": "Удовлетворённость клиента", "category": "Коммуникация", "weight": 10, "description": "Клиент не выражал негатива, остался доволен", "auto_source": "emotion"},
            {"id": "problem_resolution", "name": "Решение вопроса", "category": "Результат", "weight": 15, "description": "Вопрос клиента решён или назначены чёткие следующие шаги", "auto_source": "summary"},
            {"id": "talk_balance", "name": "Баланс диалога", "category": "Коммуникация", "weight": 10, "description": "Оператор не перебивал, соотношение говорения сбалансировано", "auto_source": "conversation_stats"},
            {"id": "closing", "name": "Завершение разговора", "category": "Скрипт", "weight": 10, "description": "Оператор подвёл итог, поблагодарил за звонок, попрощался", "auto_source": "script_analysis"},
            {"id": "upsell", "name": "Допродажа / Кросс-продажа", "category": "Продажи", "weight": 5, "description": "Оператор предложил дополнительные услуги (паркинг, отделка)", "auto_source": "manual"},
        ],
    },
    {
        "name": "Оценка работы с жалобами",
        "description": "Специализированная карта для оценки обработки жалоб жильцов МинскМир",
        "criteria": [
            {"id": "empathy", "name": "Эмпатия и сочувствие", "category": "Коммуникация", "weight": 20, "description": "Оператор выразил понимание, сочувствие, не перебивал", "auto_source": "emotion"},
            {"id": "complaint_details", "name": "Сбор деталей жалобы", "category": "Процесс", "weight": 15, "description": "Оператор уточнил все детали: адрес, дату, суть проблемы", "auto_source": "script_analysis"},
            {"id": "no_forbidden", "name": "Отсутствие запрещённых фраз", "category": "Скрипт", "weight": 15, "description": "Оператор не использовал «успокойтесь», «вы не правы» и т.п.", "auto_source": "script_analysis"},
            {"id": "solution_offered", "name": "Предложено решение", "category": "Результат", "weight": 20, "description": "Оператор предложил конкретный план решения проблемы", "auto_source": "summary"},
            {"id": "follow_up", "name": "Назначен follow-up", "category": "Результат", "weight": 15, "description": "Клиенту сообщены сроки и следующие шаги", "auto_source": "summary"},
            {"id": "deescalation", "name": "Деэскалация", "category": "Коммуникация", "weight": 15, "description": "Оператор успешно снизил эмоциональный накал", "auto_source": "emotion"},
        ],
    },
    {
        "name": "Контроль исходящих продаж",
        "description": "Карта оценки для исходящих звонков по продаже квартир",
        "criteria": [
            {"id": "intro", "name": "Представление", "category": "Скрипт", "weight": 10, "description": "Оператор чётко представился и назвал цель звонка", "auto_source": "script_analysis"},
            {"id": "interest_check", "name": "Выявление интереса", "category": "Скрипт", "weight": 15, "description": "Оператор выяснил текущую ситуацию и потребности клиента", "auto_source": "script_analysis"},
            {"id": "benefits", "name": "Презентация преимуществ", "category": "Продажи", "weight": 15, "description": "Описаны ключевые преимущества МинскМир", "auto_source": "script_analysis"},
            {"id": "objection_handling", "name": "Работа с возражениями", "category": "Продажи", "weight": 15, "description": "Оператор грамотно обработал возражения", "auto_source": "manual"},
            {"id": "cta", "name": "Призыв к действию", "category": "Продажи", "weight": 15, "description": "Оператор пригласил на просмотр или назначил встречу", "auto_source": "script_analysis"},
            {"id": "politeness", "name": "Вежливость и профессионализм", "category": "Коммуникация", "weight": 10, "description": "Оператор был вежлив, не давил на клиента", "auto_source": "emotion"},
            {"id": "data_capture", "name": "Фиксация данных", "category": "Процесс", "weight": 10, "description": "Оператор записал контакты, предпочтения, дату следующего контакта", "auto_source": "manual"},
            {"id": "farewell", "name": "Прощание", "category": "Скрипт", "weight": 10, "description": "Оператор корректно попрощался", "auto_source": "script_analysis"},
        ],
    },
]

# ── Coaching Insights Templates ──────────────────────────────────────────────

INSIGHT_TEMPLATES = {
    "skill_gap": [
        {
            "title": "Низкий балл за выяснение потребностей",
            "description": "За последний месяц менеджер {name} набрал средний балл {score:.0f}% по критерию «Выяснение потребностей». Рекомендуется провести тренинг по технике SPIN-вопросов и активного слушания.",
            "priority": "high",
            "metadata": {"metric": "needs_discovery", "avg_score": None, "threshold": 70, "calls_analyzed": None},
        },
        {
            "title": "Слабая работа с возражениями",
            "description": "Менеджер {name} в {pct:.0f}% звонков не отрабатывает возражения клиентов. Это приводит к потере потенциальных сделок. Рекомендуется отработка на тренинге по методике LAER.",
            "priority": "high",
            "metadata": {"metric": "objection_handling", "failure_rate": None, "calls_analyzed": None},
        },
    ],
    "training_need": [
        {
            "title": "Требуется обучение по продукту «Паркинг»",
            "description": "Менеджер {name} в {count} звонках не смог ответить на вопросы о паркинге и кладовых. Рекомендуется обучение по продуктовой линейке дополнительных услуг.",
            "priority": "medium",
            "metadata": {"topic": "parking_knowledge", "unanswered_count": None, "calls_analyzed": None},
        },
        {
            "title": "Обучение работе с ипотечными программами",
            "description": "Менеджер {name} допускал неточности при консультировании по ипотечным программам. Рекомендуется обновление знаний по текущим условиям банков-партнёров.",
            "priority": "medium",
            "metadata": {"topic": "mortgage_programs", "error_count": None, "calls_analyzed": None},
        },
    ],
    "coaching_recommendation": [
        {
            "title": "Рекомендация: работа с тоном голоса",
            "description": "Анализ показал, что менеджер {name} часто использует монотонный тон. В {pct:.0f}% звонков клиенты теряли интерес. Рекомендуется коучинг-сессия по управлению голосом и интонацией.",
            "priority": "medium",
            "metadata": {"metric": "voice_tone", "monotone_rate": None, "calls_analyzed": None},
        },
        {
            "title": "Рекомендация: сокращение пауз в диалоге",
            "description": "У менеджера {name} среднее время молчания составляет {silence:.0f}% от общей длительности звонка (норма — до 15%). Рекомендуется практика по поддержанию ритма диалога.",
            "priority": "low",
            "metadata": {"metric": "silence_ratio", "avg_silence_pct": None, "calls_analyzed": None},
        },
    ],
    "performance_trend": [
        {
            "title": "Снижение конверсии в просмотры",
            "description": "За последние 2 недели у менеджера {name} конверсия звонков в записи на просмотр снизилась с {prev:.0f}% до {curr:.0f}%. Рекомендуется анализ последних звонков совместно с руководителем.",
            "priority": "high",
            "metadata": {"metric": "viewing_conversion", "current_rate": None, "previous_rate": None, "period_days": 14},
        },
        {
            "title": "Рост среднего времени обработки",
            "description": "Среднее время обработки звонков менеджера {name} выросло на {delta:.0f}% за последний месяц. Текущее AHT: {aht:.0f} сек. Необходимо выявить причину и оптимизировать скрипт.",
            "priority": "medium",
            "metadata": {"metric": "aht", "current_aht": None, "previous_aht": None, "period_days": 30},
        },
    ],
    "strength": [
        {
            "title": "Отличная работа с приветствием",
            "description": "Менеджер {name} стабильно получает высший балл ({score:.0f}%) за приветствие и представление. Может быть наставником для новых сотрудников.",
            "priority": "low",
            "metadata": {"metric": "greeting", "avg_score": None, "calls_analyzed": None},
        },
        {
            "title": "Высокая удовлетворённость клиентов",
            "description": "У менеджера {name} {pct:.0f}% звонков завершаются с позитивным настроем клиента. Это лучший результат в команде «{team}».",
            "priority": "low",
            "metadata": {"metric": "client_satisfaction", "positive_rate": None, "team_avg": None},
        },
    ],
    "improvement_area": [
        {
            "title": "Зона роста: завершение разговора",
            "description": "Менеджер {name} в {pct:.0f}% звонков не подводит итог и не проговаривает следующие шаги. Это снижает конверсию повторных обращений.",
            "priority": "medium",
            "metadata": {"metric": "closing", "missing_rate": None, "calls_analyzed": None},
        },
        {
            "title": "Зона роста: кросс-продажи",
            "description": "Менеджер {name} предлагает дополнительные услуги только в {pct:.0f}% звонков (средний по команде — {team_avg:.0f}%). Рекомендуется отработка навыка допродаж.",
            "priority": "medium",
            "metadata": {"metric": "upsell", "current_rate": None, "team_avg_rate": None},
        },
    ],
}


# ── Evaluation helpers ────────────────────────────────────────────────────────


def _evaluate_criterion(criterion: dict) -> dict:
    """Generate a realistic evaluation result for a single criterion."""
    source = criterion["auto_source"]
    weight = criterion["weight"]

    # Different score distributions per source type
    if source == "script_analysis":
        score_pct = random.choices(
            [random.uniform(0.85, 1.0), random.uniform(0.6, 0.85), random.uniform(0.3, 0.6), 0.0],
            weights=[0.45, 0.30, 0.15, 0.10],
        )[0]
    elif source == "emotion":
        score_pct = random.choices(
            [random.uniform(0.8, 1.0), random.uniform(0.5, 0.8), random.uniform(0.2, 0.5)],
            weights=[0.50, 0.35, 0.15],
        )[0]
    elif source == "summary":
        score_pct = random.choices(
            [1.0, random.uniform(0.5, 0.8), 0.0],
            weights=[0.55, 0.25, 0.20],
        )[0]
    elif source == "conversation_stats":
        score_pct = random.choices(
            [random.uniform(0.8, 1.0), random.uniform(0.4, 0.8), random.uniform(0.0, 0.4)],
            weights=[0.50, 0.35, 0.15],
        )[0]
    else:  # manual
        score_pct = random.choices(
            [random.uniform(0.7, 1.0), random.uniform(0.3, 0.7), 0.0],
            weights=[0.40, 0.40, 0.20],
        )[0]

    score = round(weight * score_pct, 1)
    passed = score_pct >= 0.6

    notes_passed = [
        "Критерий выполнен",
        "Соответствует стандарту",
        "Хороший результат",
        "Выполнено в полном объёме",
    ]
    notes_failed = [
        "Не выполнено",
        "Требуется улучшение",
        "Критерий не соблюдён",
        "Частично выполнено, но ниже порога",
    ]

    return {
        "criterion_id": criterion["id"],
        "score": score,
        "max_score": float(weight),
        "passed": passed,
        "auto_evaluated": source != "manual",
        "notes": random.choice(notes_passed if passed else notes_failed),
    }


# ── Main seed ────────────────────────────────────────────────────────────────


async def seed():
    async with async_session() as db:
        # ── Clean old QA/Coaching data ────────────────────────────────────
        print("Cleaning old QA & Coaching data...")
        old_sc_ids = select(QAScorecard.id).where(QAScorecard.organization_id == DANA_PROJECT_ID)
        await db.execute(delete(QAEvaluation).where(QAEvaluation.scorecard_id.in_(old_sc_ids)))
        await db.execute(delete(QAScorecard).where(QAScorecard.organization_id == DANA_PROJECT_ID))
        await db.execute(delete(CoachingInsight).where(CoachingInsight.organization_id == DANA_PROJECT_ID))
        await db.flush()
        print("  Done.")

        # ── Create QA Scorecards ──────────────────────────────────────────
        scorecards = []
        for sc_data in SCORECARDS:
            sc = QAScorecard(
                organization_id=DANA_PROJECT_ID,
                name=sc_data["name"],
                description=sc_data["description"],
                is_active=True,
                criteria=sc_data["criteria"],
            )
            db.add(sc)
            await db.flush()
            scorecards.append(sc)
            print(f"  Scorecard: {sc.name} ({len(sc_data['criteria'])} criteria)")

        # ── Get completed calls ───────────────────────────────────────────
        result = await db.execute(
            select(Call.id, Call.created_at)
            .where(
                Call.organization_id == DANA_PROJECT_ID,
                Call.status == CallStatus.COMPLETED,
            )
            .order_by(Call.created_at.desc())
        )
        completed_calls = result.all()
        print(f"\nFound {len(completed_calls)} completed calls")

        # ── Create QA Evaluations ─────────────────────────────────────────
        # Evaluate ~70% of calls with the primary scorecard, ~30% with others
        print("\nGenerating QA evaluations...")
        batch = []
        eval_count = 0

        for call_id, call_created_at in completed_calls:
            # 80% chance of being evaluated
            if random.random() > 0.80:
                continue

            # Pick scorecard: 60% primary, 20% complaints, 20% outbound
            sc = random.choices(scorecards, weights=[0.60, 0.20, 0.20])[0]

            results = [_evaluate_criterion(c) for c in sc.criteria]
            total_score = round(sum(r["score"] for r in results), 1)
            max_possible = round(sum(r["max_score"] for r in results), 1)

            comments_pool = [
                None,
                None,
                "Хороший звонок, оператор следовал скрипту.",
                "Есть замечания по работе с возражениями.",
                "Клиент остался доволен, все этапы пройдены.",
                "Оператор пропустил этап выяснения потребностей.",
                "Необходима дополнительная работа над завершением звонка.",
                "Отличная обработка жалобы, клиент успокоился.",
                "Оператор слишком долго говорил, не давая клиенту слово.",
            ]

            evaluation = QAEvaluation(
                call_id=call_id,
                scorecard_id=sc.id,
                evaluator_id=None,
                total_score=total_score,
                max_possible_score=max_possible,
                results=results,
                comments=random.choice(comments_pool),
                status="completed",
            )
            batch.append(evaluation)
            eval_count += 1

            if len(batch) >= BATCH_SIZE:
                db.add_all(batch)
                await db.flush()
                print(f"  Evaluations batch: {eval_count} total")
                batch.clear()

        if batch:
            db.add_all(batch)
            await db.flush()

        print(f"  Total QA evaluations: {eval_count}")

        # ── Get managers and AI coach agent ───────────────────────────────
        result = await db.execute(
            select(Manager).where(Manager.organization_id == DANA_PROJECT_ID)
        )
        managers = result.scalars().all()

        result = await db.execute(
            select(AIAgent).where(
                AIAgent.organization_id == DANA_PROJECT_ID,
                AIAgent.agent_type == "coach",
            )
        )
        coach_agent = result.scalar_one_or_none()

        # ── Create Coaching Insights ──────────────────────────────────────
        print("\nGenerating coaching insights...")
        insight_count = 0

        for manager in managers:
            # Each manager gets 3-7 insights
            num_insights = random.randint(3, 7)
            # Pick insight types with realistic distribution
            types_pool = list(INSIGHT_TEMPLATES.keys())
            type_weights = [0.20, 0.15, 0.20, 0.15, 0.15, 0.15]

            chosen_types = random.choices(types_pool, weights=type_weights, k=num_insights)

            for insight_type in chosen_types:
                templates = INSIGHT_TEMPLATES[insight_type]
                template = random.choice(templates)

                # Generate random values for template
                score = random.uniform(35, 95)
                pct = random.uniform(20, 80)
                count = random.randint(3, 15)
                silence = random.uniform(18, 35)
                prev = random.uniform(30, 60)
                curr = prev * random.uniform(0.5, 0.85)
                aht = random.uniform(180, 600)
                delta = random.uniform(10, 40)
                team_avg = random.uniform(30, 55)

                title = template["title"]
                description = template["description"].format(
                    name=manager.name,
                    score=score,
                    pct=pct,
                    count=count,
                    silence=silence,
                    prev=prev,
                    curr=curr,
                    aht=aht,
                    delta=delta,
                    team=manager.team or "Продажи",
                    team_avg=team_avg,
                )

                # Fill metadata
                meta = dict(template["metadata"])
                for k, v in meta.items():
                    if v is None:
                        if "score" in k:
                            meta[k] = round(score, 1)
                        elif "rate" in k or "pct" in k:
                            meta[k] = round(pct, 1)
                        elif "count" in k:
                            meta[k] = random.randint(15, 60)
                        elif "aht" in k:
                            meta[k] = round(aht, 1)
                meta["manager_name"] = manager.name
                meta["manager_team"] = manager.team

                # Distribute statuses: mostly active, some acknowledged/resolved
                status = random.choices(
                    ["active", "acknowledged", "resolved", "dismissed"],
                    weights=[0.50, 0.25, 0.15, 0.10],
                )[0]

                # Insights created over the last 30 days
                created_at = datetime.now(timezone.utc) - timedelta(
                    days=random.randint(0, 30),
                    hours=random.randint(0, 23),
                )

                insight = CoachingInsight(
                    organization_id=DANA_PROJECT_ID,
                    manager_id=manager.id,
                    ai_agent_id=coach_agent.id if coach_agent else None,
                    ai_agent_run_id=None,
                    insight_type=insight_type,
                    title=title,
                    description=description,
                    priority=template["priority"],
                    metadata_json=meta,
                    status=status,
                )
                insight.created_at = created_at
                insight.updated_at = created_at
                db.add(insight)
                insight_count += 1

            print(f"  {manager.name}: {num_insights} insights")

        await db.flush()
        await db.commit()

        print(f"\nSeed complete!")
        print(f"  QA Scorecards: {len(scorecards)}")
        print(f"  QA Evaluations: {eval_count}")
        print(f"  Coaching Insights: {insight_count}")


if __name__ == "__main__":
    asyncio.run(seed())
