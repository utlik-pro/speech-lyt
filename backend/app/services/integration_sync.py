"""Helper to build call data dict for integration sync."""

import logging
import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import async_session
from app.integrations.registry import IntegrationRegistry
from app.models.call import Call
from app.models.emotion import EmotionAnalysis
from app.models.integration_config import IntegrationConfig
from app.models.summary import CallSummary
from app.models.transcription import Transcription

logger = logging.getLogger(__name__)


async def build_call_sync_data(db: AsyncSession, call: Call) -> dict:
    """Build a dict with call + analysis data for external sync."""
    data: dict = {
        "call_id": str(call.id),
        "external_id": call.external_id if hasattr(call, "external_id") else None,
        "phone_number": call.phone_number,
        "direction": call.direction.value if call.direction else None,
        "duration_seconds": call.duration_seconds,
        "status": call.status.value if call.status else None,
        "agent_id": str(call.agent_id) if call.agent_id else None,
    }

    # Transcription
    result = await db.execute(
        select(Transcription).where(Transcription.call_id == call.id)
    )
    transcription = result.scalar_one_or_none()
    if transcription:
        data["transcription_text"] = transcription.full_text[:2000]  # truncate for API

    # Emotion
    result = await db.execute(
        select(EmotionAnalysis).where(EmotionAnalysis.call_id == call.id)
    )
    emotion = result.scalar_one_or_none()
    if emotion:
        data["sentiment"] = emotion.overall_sentiment.value if emotion.overall_sentiment else None

    # Summary
    result = await db.execute(
        select(CallSummary).where(CallSummary.call_id == call.id)
    )
    summary = result.scalar_one_or_none()
    if summary:
        data["summary"] = summary.short_summary
        data["category"] = summary.category

    return data


async def sync_call_to_all_integrations(call_id: str, organization_id: uuid.UUID) -> None:
    """Sync completed call to all active integrations for the organization."""
    async with async_session() as db:
        call = await db.get(Call, call_id)
        if not call:
            logger.warning(f"Call {call_id} not found for integration sync")
            return

        result = await db.execute(
            select(IntegrationConfig).where(
                IntegrationConfig.organization_id == organization_id,
                IntegrationConfig.is_active.is_(True),
            )
        )
        configs = result.scalars().all()

        if not configs:
            return

        call_data = await build_call_sync_data(db, call)

        for config in configs:
            try:
                integration = IntegrationRegistry.create(
                    config.integration_type, config.settings, config.credentials
                )
                sync_result = await integration.sync_call(call_data)
                config.last_sync_status = sync_result.get("status", "unknown")
                config.last_sync_error = sync_result.get("error")
                logger.info(
                    f"Integration {config.integration_type.value} sync for call {call_id}: "
                    f"{sync_result.get('status')}"
                )
            except Exception as e:
                config.last_sync_status = "error"
                config.last_sync_error = str(e)[:1000]
                logger.warning(
                    f"Integration {config.integration_type.value} sync failed for call {call_id}: {e}"
                )

        await db.commit()
