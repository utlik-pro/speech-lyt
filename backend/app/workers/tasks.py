import asyncio
import logging
from pathlib import Path

from app.workers.celery_app import celery_app

logger = logging.getLogger(__name__)


def run_async(coro):
    """Run async function from sync Celery task."""
    loop = asyncio.new_event_loop()
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()


@celery_app.task(bind=True, name="process_call", max_retries=3)
def process_call(self, call_id: str):
    """Main pipeline: download audio -> ASR -> save transcription -> trigger analysis."""
    logger.info(f"Processing call {call_id}")

    try:
        run_async(_process_call_async(call_id))
    except Exception as exc:
        logger.error(f"Failed to process call {call_id}: {exc}")
        run_async(_update_call_status(call_id, "failed", str(exc)))
        raise self.retry(exc=exc, countdown=60)


async def _process_call_async(call_id: str):
    from app.core.database import async_session
    from app.models.call import Call, CallStatus
    from app.models.transcription import Transcription
    from app.services.asr.manager import transcribe_audio
    from app.services.audio import audio_service
    from app.services.diarization import diarization_service
    from app.services.storage import storage_service

    async with async_session() as db:
        call = await db.get(Call, call_id)
        if not call:
            raise ValueError(f"Call {call_id} not found")

        # Update status to processing
        call.status = CallStatus.PROCESSING
        await db.commit()

        # Download audio
        logger.info(f"Downloading audio for call {call_id}")
        audio_data = await storage_service.download(call.audio_url)

        # Convert to WAV for Whisper
        wav_path = audio_service.export_to_tempfile(audio_data, call.audio_format)

        try:
            # Transcribe
            call.status = CallStatus.TRANSCRIBING
            await db.commit()
            logger.info(f"Transcribing call {call_id}")
            result = await transcribe_audio(wav_path, language="ru")

            # Diarize — assign speakers to segments
            call.status = CallStatus.ANALYZING
            await db.commit()
            logger.info(f"Diarizing call {call_id}")
            raw_segments = [
                {
                    "speaker": seg.speaker,
                    "text": seg.text,
                    "start_time": seg.start_time,
                    "end_time": seg.end_time,
                    "confidence": seg.confidence,
                }
                for seg in result.segments
            ]
            segments_with_speakers = await diarization_service.assign_speakers(
                audio_path=wav_path,
                segments=raw_segments,
            )

            # Save transcription
            transcription = Transcription(
                call_id=call.id,
                full_text=result.full_text,
                language=result.language,
                segments=segments_with_speakers,
                asr_provider=result.provider,
                asr_model=result.model,
            )
            db.add(transcription)

            # Run emotion analysis
            logger.info(f"Running emotion analysis for call {call_id}")
            try:
                from app.models.emotion import EmotionAnalysis, SentimentType
                from app.services.emotions.analyzer import EmotionAnalyzer

                emotion_analyzer = EmotionAnalyzer()
                emotion_result = await emotion_analyzer.analyze(
                    transcription_text=result.full_text,
                    segments=segments_with_speakers,
                )
                emotion_analysis = EmotionAnalysis(
                    call_id=call.id,
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
                db.add(emotion_analysis)
                logger.info(f"Emotion analysis saved for call {call_id}")
            except Exception as e:
                logger.warning(f"Emotion analysis failed for call {call_id}: {e}")

            # Generate call summary
            logger.info(f"Generating summary for call {call_id}")
            try:
                from app.models.summary import CallSummary
                from app.services.summary.generator import SummaryGenerator

                summary_generator = SummaryGenerator()
                summary_result = await summary_generator.generate(
                    transcription_text=result.full_text,
                    segments=segments_with_speakers,
                )
                call_summary = CallSummary(
                    call_id=call.id,
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
                db.add(call_summary)
                logger.info(f"Summary saved for call {call_id}")
            except Exception as e:
                logger.warning(f"Summary generation failed for call {call_id}: {e}")

            # Mark completed
            call.status = CallStatus.COMPLETED
            call.duration_seconds = result.duration_seconds or call.duration_seconds
            await db.commit()

            logger.info(
                f"Call {call_id} processed: {len(segments_with_speakers)} segments, "
                f"{len(result.full_text)} chars"
            )

            # Dispatch webhook notifications
            try:
                from app.services.webhooks import dispatch_webhooks

                await dispatch_webhooks(
                    organization_id=call.organization_id,
                    event="call.completed",
                    data={
                        "call_id": str(call.id),
                        "status": call.status.value,
                        "duration_seconds": call.duration_seconds,
                        "segments_count": len(segments_with_speakers),
                    },
                )
            except Exception as e:
                logger.warning(f"Webhook dispatch failed for call {call_id}: {e}")

        finally:
            Path(wav_path).unlink(missing_ok=True)


@celery_app.task(bind=True, name="analyze_call", max_retries=2)
def analyze_call(self, call_id: str):
    """Run emotion analysis and summary generation on an already-transcribed call."""
    logger.info(f"Running analysis for call {call_id}")
    try:
        run_async(_analyze_call_async(call_id))
    except Exception as exc:
        logger.error(f"Analysis failed for call {call_id}: {exc}")
        raise self.retry(exc=exc, countdown=30)


async def _analyze_call_async(call_id: str):
    from app.core.database import async_session
    from app.models.call import Call
    from app.models.emotion import EmotionAnalysis, SentimentType
    from app.models.summary import CallSummary
    from app.models.transcription import Transcription
    from app.services.emotions.analyzer import EmotionAnalyzer
    from app.services.summary.generator import SummaryGenerator
    from sqlalchemy import select

    async with async_session() as db:
        call = await db.get(Call, call_id)
        if not call:
            raise ValueError(f"Call {call_id} not found")

        result = await db.execute(
            select(Transcription).where(Transcription.call_id == call_id)
        )
        transcription = result.scalar_one_or_none()
        if not transcription:
            raise ValueError(f"No transcription for call {call_id}")

        segments = transcription.segments or []

        # Emotion analysis (skip if exists)
        existing = await db.execute(
            select(EmotionAnalysis).where(EmotionAnalysis.call_id == call_id)
        )
        if not existing.scalar_one_or_none():
            analyzer = EmotionAnalyzer()
            emotion_result = await analyzer.analyze(transcription.full_text, segments)
            emotion = EmotionAnalysis(
                call_id=call.id,
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

        # Summary (skip if exists)
        existing = await db.execute(
            select(CallSummary).where(CallSummary.call_id == call_id)
        )
        if not existing.scalar_one_or_none():
            generator = SummaryGenerator()
            summary_result = await generator.generate(transcription.full_text, segments)
            summary = CallSummary(
                call_id=call.id,
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
        logger.info(f"Analysis complete for call {call_id}")


async def _update_call_status(call_id: str, status: str, error: str | None = None):
    from app.core.database import async_session
    from app.models.call import Call, CallStatus

    async with async_session() as db:
        call = await db.get(Call, call_id)
        if call:
            call.status = CallStatus(status)
            call.error_message = error
            await db.commit()
