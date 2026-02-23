"""Analytics API — endpoints for emotion analysis, call summaries, and conversation stats."""

import uuid

from fastapi import APIRouter, HTTPException
from sqlalchemy import select

from app.core.database import async_session
from app.models.call import Call
from app.models.emotion import EmotionAnalysis
from app.models.summary import CallSummary
from app.models.transcription import Transcription
from app.schemas.call import ConversationStatsResponse, TranscriptionResponse
from app.schemas.emotion import EmotionAnalysisResponse
from app.schemas.summary import CallSummaryResponse
from app.services.conversation_stats import calculate_conversation_stats

router = APIRouter(tags=["analytics"])


@router.get("/calls/{call_id}/emotions", response_model=EmotionAnalysisResponse)
async def get_call_emotions(call_id: uuid.UUID):
    """Get emotion analysis for a specific call."""
    async with async_session() as db:
        call = await db.get(Call, call_id)
        if not call:
            raise HTTPException(status_code=404, detail="Call not found")

        result = await db.execute(
            select(EmotionAnalysis).where(EmotionAnalysis.call_id == call_id)
        )
        analysis = result.scalar_one_or_none()
        if not analysis:
            raise HTTPException(
                status_code=404,
                detail="Emotion analysis not available for this call",
            )
        return EmotionAnalysisResponse.model_validate(analysis)


@router.get("/calls/{call_id}/summary", response_model=CallSummaryResponse)
async def get_call_summary(call_id: uuid.UUID):
    """Get AI-generated summary for a specific call."""
    async with async_session() as db:
        call = await db.get(Call, call_id)
        if not call:
            raise HTTPException(status_code=404, detail="Call not found")

        result = await db.execute(
            select(CallSummary).where(CallSummary.call_id == call_id)
        )
        summary = result.scalar_one_or_none()
        if not summary:
            raise HTTPException(
                status_code=404,
                detail="Summary not available for this call",
            )
        return CallSummaryResponse.model_validate(summary)


@router.post("/calls/{call_id}/analyze")
async def trigger_call_analysis(call_id: uuid.UUID):
    """Manually trigger emotion analysis and summary generation for a call."""
    async with async_session() as db:
        call = await db.get(Call, call_id)
        if not call:
            raise HTTPException(status_code=404, detail="Call not found")

        # Check if transcription exists
        result = await db.execute(
            select(Transcription).where(Transcription.call_id == call_id)
        )
        transcription = result.scalar_one_or_none()
        if not transcription:
            raise HTTPException(
                status_code=400,
                detail="Call has no transcription. Wait for processing to complete.",
            )

        # Run analysis in background via Celery
        try:
            from app.workers.tasks import analyze_call
            analyze_call.delay(str(call_id))
            return {"message": "Analysis triggered successfully", "call_id": call_id}
        except Exception:
            # If Celery isn't running, run inline
            pass

        # Inline fallback: run analysis directly
        from app.models.emotion import EmotionAnalysis, SentimentType
        from app.models.summary import CallSummary
        from app.services.emotions.analyzer import EmotionAnalyzer
        from app.services.summary.generator import SummaryGenerator

        segments = transcription.segments or []

        # Emotion analysis
        existing_emotion = await db.execute(
            select(EmotionAnalysis).where(EmotionAnalysis.call_id == call_id)
        )
        if not existing_emotion.scalar_one_or_none():
            analyzer = EmotionAnalyzer()
            emotion_result = await analyzer.analyze(transcription.full_text, segments)
            emotion = EmotionAnalysis(
                call_id=call_id,
                overall_sentiment=SentimentType(emotion_result.overall_sentiment),
                agent_sentiment=SentimentType(emotion_result.agent_sentiment),
                client_sentiment=SentimentType(emotion_result.client_sentiment),
                emotion_timeline=[
                    {"time": e.time, "sentiment": e.sentiment, "intensity": e.intensity}
                    for e in emotion_result.emotion_timeline
                ],
                critical_moments=[
                    {"time": m.time, "type": m.type, "description": m.description}
                    for m in emotion_result.critical_moments
                ],
            )
            db.add(emotion)

        # Summary
        existing_summary = await db.execute(
            select(CallSummary).where(CallSummary.call_id == call_id)
        )
        if not existing_summary.scalar_one_or_none():
            generator = SummaryGenerator()
            summary_result = await generator.generate(transcription.full_text, segments)
            summary = CallSummary(
                call_id=call_id,
                short_summary=summary_result.short_summary,
                topic=summary_result.topic,
                problem=summary_result.problem,
                solution=summary_result.solution,
                outcome=summary_result.outcome,
                next_steps=summary_result.next_steps,
                entities=[
                    {"name": e.name, "type": e.type, "value": e.value}
                    for e in summary_result.entities
                ],
                tags=summary_result.tags,
                category=summary_result.category,
            )
            db.add(summary)

        await db.commit()
        return {"message": "Analysis completed", "call_id": call_id}


@router.get("/calls/{call_id}/conversation-stats", response_model=ConversationStatsResponse)
async def get_conversation_stats(call_id: uuid.UUID):
    """Get conversation statistics (talk time, silence, interruptions, etc.)."""
    async with async_session() as db:
        call = await db.get(Call, call_id)
        if not call:
            raise HTTPException(status_code=404, detail="Call not found")

        result = await db.execute(
            select(Transcription).where(Transcription.call_id == call_id)
        )
        transcription = result.scalar_one_or_none()
        if not transcription:
            raise HTTPException(
                status_code=404,
                detail="Transcription not available for this call",
            )

        stats = calculate_conversation_stats(
            transcription.segments or [],
            call.duration_seconds or 0,
        )
        return ConversationStatsResponse(**stats)


@router.get("/calls/{call_id}/transcription", response_model=TranscriptionResponse)
async def get_call_transcription(call_id: uuid.UUID):
    """Get full transcription with segments for a call."""
    async with async_session() as db:
        call = await db.get(Call, call_id)
        if not call:
            raise HTTPException(status_code=404, detail="Call not found")

        result = await db.execute(
            select(Transcription).where(Transcription.call_id == call_id)
        )
        transcription = result.scalar_one_or_none()
        if not transcription:
            raise HTTPException(
                status_code=404,
                detail="Transcription not available for this call",
            )

        return TranscriptionResponse.model_validate(transcription)
