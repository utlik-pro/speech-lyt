import uuid

from fastapi import APIRouter, HTTPException
from sqlalchemy import select, func

from app.core.database import async_session
from app.middleware.auth import generate_api_key, hash_api_key
from app.models.api_key import APIKey
from app.schemas.api_key import APIKeyCreate, APIKeyCreateResponse, APIKeyListResponse, APIKeyResponse
from app.services.audit import audit_service

router = APIRouter(prefix="/api-keys", tags=["api-keys"])

# Temporary hardcoded org_id until auth is implemented
TEMP_ORG_ID = uuid.UUID("00000000-0000-0000-0000-000000000001")


@router.post("", response_model=APIKeyCreateResponse, status_code=201)
async def create_api_key(payload: APIKeyCreate):
    """Generate a new API key for the organization.

    The raw key is returned only once in the response. It is stored as a SHA-256
    hash and cannot be retrieved again.
    """
    raw_key = generate_api_key()
    key_hash = hash_api_key(raw_key)

    async with async_session() as db:
        api_key = APIKey(
            organization_id=TEMP_ORG_ID,
            key_hash=key_hash,
            name=payload.name,
            is_active=True,
        )
        db.add(api_key)
        await db.commit()
        await db.refresh(api_key)

        # Audit log
        await audit_service.log(
            organization_id=TEMP_ORG_ID,
            action="api_key.created",
            resource_type="api_key",
            resource_id=str(api_key.id),
            details={"name": payload.name},
        )

        return APIKeyCreateResponse(
            id=api_key.id,
            name=api_key.name,
            key=raw_key,
            created_at=api_key.created_at,
        )


@router.get("", response_model=APIKeyListResponse)
async def list_api_keys():
    """List all active API keys for the organization (keys are not exposed)."""
    async with async_session() as db:
        query = (
            select(APIKey)
            .where(APIKey.organization_id == TEMP_ORG_ID, APIKey.is_active == True)
            .order_by(APIKey.created_at.desc())
        )
        result = await db.execute(query)
        keys = result.scalars().all()

        count_query = select(func.count()).select_from(query.subquery())
        total = (await db.execute(count_query)).scalar() or 0

        return APIKeyListResponse(
            items=[APIKeyResponse.model_validate(k) for k in keys],
            total=total,
        )


@router.delete("/{key_id}", status_code=200)
async def revoke_api_key(key_id: uuid.UUID):
    """Revoke (soft-delete) an API key by setting is_active to False."""
    async with async_session() as db:
        api_key = await db.get(APIKey, key_id)
        if not api_key or api_key.organization_id != TEMP_ORG_ID:
            raise HTTPException(status_code=404, detail="API key not found")

        if not api_key.is_active:
            raise HTTPException(status_code=400, detail="API key is already revoked")

        api_key.is_active = False
        await db.commit()

        # Audit log
        await audit_service.log(
            organization_id=TEMP_ORG_ID,
            action="api_key.revoked",
            resource_type="api_key",
            resource_id=str(api_key.id),
            details={"name": api_key.name},
        )

        return {"message": "API key revoked successfully"}
