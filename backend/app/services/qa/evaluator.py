"""QA auto-evaluation service.

Automatically evaluates calls against a QA scorecard using existing analysis data:
- ScriptAnalysis → script compliance scores
- EmotionAnalysis → sentiment scores
- CallSummary → outcome/resolution
- ConversationStats → talk/listen ratio, silence, interruptions
"""

import logging
import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.call import Call
from app.models.emotion import EmotionAnalysis, SentimentType
from app.models.qa import QAEvaluation, QAScorecard
from app.models.script import ScriptAnalysis
from app.models.summary import CallSummary
from app.models.transcription import Transcription
from app.services.conversation_stats import compute_conversation_stats

logger = logging.getLogger(__name__)


async def auto_evaluate(
    db: AsyncSession,
    call_id: uuid.UUID,
    scorecard: QAScorecard,
) -> QAEvaluation:
    """Run automatic QA evaluation for a call against a scorecard."""

    # Load related data
    call = await db.get(Call, call_id)
    if not call:
        raise ValueError(f"Call {call_id} not found")

    # Load analysis data
    emotion_q = await db.execute(
        select(EmotionAnalysis).where(EmotionAnalysis.call_id == call_id)
    )
    emotion: EmotionAnalysis | None = emotion_q.scalar_one_or_none()

    summary_q = await db.execute(
        select(CallSummary).where(CallSummary.call_id == call_id)
    )
    summary: CallSummary | None = summary_q.scalar_one_or_none()

    script_q = await db.execute(
        select(ScriptAnalysis).where(ScriptAnalysis.call_id == call_id)
    )
    script_analysis: ScriptAnalysis | None = script_q.scalar_one_or_none()

    # Compute conversation stats from transcription
    conv_stats = None
    transcription_q = await db.execute(
        select(Transcription).where(Transcription.call_id == call_id)
    )
    transcription = transcription_q.scalar_one_or_none()
    if transcription and transcription.segments:
        try:
            conv_stats = compute_conversation_stats(
                transcription.segments,
                call.duration_seconds,
            )
        except Exception as e:
            logger.warning(f"Failed to compute conversation stats: {e}")

    # Evaluate each criterion
    results = []
    total_score = 0.0
    max_possible = 0.0

    for criterion in scorecard.criteria:
        crit_id = criterion.get("id", "unknown")
        weight = criterion.get("weight", 10)
        auto_source = criterion.get("auto_source", "manual")
        max_possible += weight

        score, passed, auto_evaluated, notes = _evaluate_criterion(
            auto_source, weight, emotion, summary, script_analysis, conv_stats
        )

        total_score += score
        results.append({
            "criterion_id": crit_id,
            "score": score,
            "max_score": weight,
            "passed": passed,
            "auto_evaluated": auto_evaluated,
            "notes": notes,
        })

    evaluation = QAEvaluation(
        call_id=call_id,
        scorecard_id=scorecard.id,
        total_score=total_score,
        max_possible_score=max_possible,
        results=results,
        status="completed",
    )
    db.add(evaluation)
    await db.flush()

    logger.info(
        f"QA evaluation for call {call_id}: {total_score}/{max_possible} "
        f"({total_score / max_possible * 100:.0f}%)" if max_possible > 0 else
        f"QA evaluation for call {call_id}: no criteria"
    )

    return evaluation


def _evaluate_criterion(
    auto_source: str,
    weight: int,
    emotion: EmotionAnalysis | None,
    summary: CallSummary | None,
    script_analysis: ScriptAnalysis | None,
    conv_stats: dict | None,
) -> tuple[float, bool, bool, str]:
    """Evaluate a single criterion. Returns (score, passed, auto_evaluated, notes)."""

    if auto_source == "script_analysis":
        if not script_analysis:
            return 0, False, True, "No script analysis available"
        passed = script_analysis.overall_score >= 70
        ratio = min(script_analysis.overall_score / 100.0, 1.0)
        return round(weight * ratio, 1), passed, True, f"Script score: {script_analysis.overall_score:.0f}%"

    elif auto_source == "emotion":
        if not emotion:
            return 0, False, True, "No emotion analysis available"
        agent_ok = emotion.agent_sentiment in (SentimentType.POSITIVE, SentimentType.NEUTRAL)
        client_ok = emotion.client_sentiment in (SentimentType.POSITIVE, SentimentType.NEUTRAL)
        passed = agent_ok and client_ok
        score = weight if passed else (weight * 0.5 if (agent_ok or client_ok) else 0)
        notes = f"Agent: {emotion.agent_sentiment.value}, Client: {emotion.client_sentiment.value}"
        return round(score, 1), passed, True, notes

    elif auto_source == "summary":
        if not summary:
            return 0, False, True, "No summary available"
        passed = summary.outcome in ("resolved", "positive")
        score = weight if passed else (weight * 0.3 if summary.outcome == "follow_up" else 0)
        return round(score, 1), passed, True, f"Outcome: {summary.outcome}"

    elif auto_source == "conversation_stats":
        if not conv_stats:
            return 0, False, True, "No conversation stats available"
        ratio = conv_stats.get("talk_listen_ratio", 1.0)
        silence_pct = conv_stats.get("silence_pct", 0)
        ratio_ok = 0.3 <= ratio <= 0.7
        silence_ok = silence_pct < 25
        passed = ratio_ok and silence_ok
        score = weight if passed else (weight * 0.5 if (ratio_ok or silence_ok) else 0)
        notes = f"Talk/Listen: {ratio:.2f}, Silence: {silence_pct:.0f}%"
        return round(score, 1), passed, True, notes

    else:  # manual
        return 0, False, False, "Requires manual review"
