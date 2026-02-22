import hashlib
import hmac
import json
import logging
import uuid
from datetime import datetime, timezone

import httpx
from sqlalchemy import select

from app.core.database import async_session
from app.models.webhook import Webhook

logger = logging.getLogger(__name__)


def _generate_signature(payload: bytes, secret: str) -> str:
    """Generate HMAC-SHA256 signature for webhook payload."""
    return hmac.new(secret.encode("utf-8"), payload, hashlib.sha256).hexdigest()


async def dispatch_webhooks(
    organization_id: uuid.UUID,
    event: str,
    data: dict,
) -> None:
    """Send POST requests to all active webhooks registered for the given event."""
    async with async_session() as db:
        result = await db.execute(
            select(Webhook).where(
                Webhook.organization_id == organization_id,
                Webhook.is_active.is_(True),
            )
        )
        webhooks = result.scalars().all()

    payload = {
        "event": event,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "data": data,
    }
    payload_bytes = json.dumps(payload, default=str).encode("utf-8")

    async with httpx.AsyncClient(timeout=10.0) as client:
        for webhook in webhooks:
            # Check if this webhook subscribes to this event
            if event not in webhook.events:
                continue

            signature = _generate_signature(payload_bytes, webhook.secret)
            headers = {
                "Content-Type": "application/json",
                "X-Webhook-Signature": f"sha256={signature}",
                "X-Webhook-Event": event,
            }

            try:
                response = await client.post(
                    webhook.url,
                    content=payload_bytes,
                    headers=headers,
                )
                logger.info(
                    f"Webhook {webhook.id} dispatched to {webhook.url}: "
                    f"status={response.status_code}"
                )
            except Exception as exc:
                logger.warning(
                    f"Webhook {webhook.id} delivery failed to {webhook.url}: {exc}"
                )


async def test_webhook(url: str, secret: str) -> tuple[bool, int | None, str]:
    """Send a test ping to a webhook URL. Returns (success, status_code, message)."""
    payload = {
        "event": "webhook.test",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "data": {"message": "This is a test webhook delivery from SpeechLyt"},
    }
    payload_bytes = json.dumps(payload, default=str).encode("utf-8")
    signature = _generate_signature(payload_bytes, secret)
    headers = {
        "Content-Type": "application/json",
        "X-Webhook-Signature": f"sha256={signature}",
        "X-Webhook-Event": "webhook.test",
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(url, content=payload_bytes, headers=headers)
            return True, response.status_code, f"Delivered successfully (HTTP {response.status_code})"
    except httpx.TimeoutException:
        return False, None, "Request timed out"
    except Exception as exc:
        return False, None, f"Delivery failed: {exc}"
