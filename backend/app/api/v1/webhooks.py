import secrets
import uuid

from fastapi import APIRouter, HTTPException, Query
from sqlalchemy import select, func

from app.core.database import async_session
from app.models.webhook import Webhook
from app.schemas.webhook import (
    WebhookCreate,
    WebhookListResponse,
    WebhookResponse,
    WebhookTestResponse,
    WebhookUpdate,
)
from app.services.webhooks import test_webhook

router = APIRouter(prefix="/webhooks", tags=["webhooks"])

# Temporary hardcoded org_id until auth is implemented
TEMP_ORG_ID = uuid.UUID("00000000-0000-0000-0000-000000000001")


@router.post("", response_model=WebhookResponse, status_code=201)
async def create_webhook(payload: WebhookCreate):
    """Register a new webhook endpoint."""
    async with async_session() as db:
        webhook = Webhook(
            organization_id=TEMP_ORG_ID,
            url=str(payload.url),
            events=payload.events,
            is_active=payload.is_active,
            secret=secrets.token_hex(32),
        )
        db.add(webhook)
        await db.commit()
        await db.refresh(webhook)
        return WebhookResponse.model_validate(webhook)


@router.get("", response_model=WebhookListResponse)
async def list_webhooks(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
):
    """List all registered webhooks for the organization."""
    async with async_session() as db:
        query = select(Webhook).where(Webhook.organization_id == TEMP_ORG_ID)

        # Count total
        count_query = select(func.count()).select_from(query.subquery())
        total = (await db.execute(count_query)).scalar() or 0

        # Paginate
        query = (
            query.order_by(Webhook.created_at.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        result = await db.execute(query)
        webhooks = result.scalars().all()

        return WebhookListResponse(
            items=[WebhookResponse.model_validate(w) for w in webhooks],
            total=total,
            page=page,
            page_size=page_size,
        )


@router.get("/{webhook_id}", response_model=WebhookResponse)
async def get_webhook(webhook_id: uuid.UUID):
    """Get a webhook by ID."""
    async with async_session() as db:
        webhook = await db.get(Webhook, webhook_id)
        if not webhook or webhook.organization_id != TEMP_ORG_ID:
            raise HTTPException(status_code=404, detail="Webhook not found")
        return WebhookResponse.model_validate(webhook)


@router.put("/{webhook_id}", response_model=WebhookResponse)
async def update_webhook(webhook_id: uuid.UUID, payload: WebhookUpdate):
    """Update a webhook's configuration."""
    async with async_session() as db:
        webhook = await db.get(Webhook, webhook_id)
        if not webhook or webhook.organization_id != TEMP_ORG_ID:
            raise HTTPException(status_code=404, detail="Webhook not found")

        update_data = payload.model_dump(exclude_unset=True)
        for field_name, value in update_data.items():
            if field_name == "url":
                value = str(value)
            setattr(webhook, field_name, value)

        await db.commit()
        await db.refresh(webhook)
        return WebhookResponse.model_validate(webhook)


@router.delete("/{webhook_id}")
async def delete_webhook(webhook_id: uuid.UUID):
    """Delete a webhook."""
    async with async_session() as db:
        webhook = await db.get(Webhook, webhook_id)
        if not webhook or webhook.organization_id != TEMP_ORG_ID:
            raise HTTPException(status_code=404, detail="Webhook not found")

        await db.delete(webhook)
        await db.commit()
        return {"message": "Webhook deleted successfully"}


@router.post("/{webhook_id}/test", response_model=WebhookTestResponse)
async def test_webhook_endpoint(webhook_id: uuid.UUID):
    """Send a test payload to the webhook URL."""
    async with async_session() as db:
        webhook = await db.get(Webhook, webhook_id)
        if not webhook or webhook.organization_id != TEMP_ORG_ID:
            raise HTTPException(status_code=404, detail="Webhook not found")

        success, status_code, message = await test_webhook(webhook.url, webhook.secret)
        return WebhookTestResponse(
            success=success,
            status_code=status_code,
            message=message,
        )
