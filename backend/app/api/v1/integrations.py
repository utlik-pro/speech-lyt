import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select

from app.api.v1.deps import get_project_id
from app.core.database import async_session
from app.integrations.registry import IntegrationRegistry
from app.models.call import Call
from app.models.integration_config import IntegrationConfig
from app.schemas.integration import (
    IntegrationCreate,
    IntegrationListResponse,
    IntegrationResponse,
    IntegrationSyncRequest,
    IntegrationSyncResponse,
    IntegrationStatusResponse,
    IntegrationTestResponse,
    IntegrationUpdate,
)
from app.services.integration_sync import build_call_sync_data

router = APIRouter(prefix="/integrations", tags=["integrations"])


@router.post("", response_model=IntegrationResponse, status_code=201)
async def create_integration(
    payload: IntegrationCreate,
    project_id: uuid.UUID = Depends(get_project_id),
):
    """Create a new integration configuration."""
    async with async_session() as db:
        config = IntegrationConfig(
            organization_id=project_id,
            integration_type=payload.integration_type,
            name=payload.name,
            credentials=payload.credentials,
            settings=payload.settings,
            is_active=payload.is_active,
        )
        db.add(config)
        await db.commit()
        await db.refresh(config)
        return IntegrationResponse.model_validate(config)


@router.get("", response_model=IntegrationListResponse)
async def list_integrations(
    project_id: uuid.UUID = Depends(get_project_id),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
):
    """List all integration configs for the organization."""
    async with async_session() as db:
        query = select(IntegrationConfig).where(IntegrationConfig.organization_id == project_id)
        total = (await db.execute(select(func.count()).select_from(query.subquery()))).scalar() or 0
        query = query.order_by(IntegrationConfig.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
        result = await db.execute(query)
        configs = result.scalars().all()
        return IntegrationListResponse(
            items=[IntegrationResponse.model_validate(c) for c in configs],
            total=total,
        )


@router.get("/types")
async def list_integration_types():
    """List supported integration types."""
    return {"types": IntegrationRegistry.supported_types()}


@router.get("/{integration_id}", response_model=IntegrationResponse)
async def get_integration(integration_id: uuid.UUID, project_id: uuid.UUID = Depends(get_project_id)):
    """Get integration config by ID."""
    async with async_session() as db:
        config = await db.get(IntegrationConfig, integration_id)
        if not config or config.organization_id != project_id:
            raise HTTPException(status_code=404, detail="Integration not found")
        return IntegrationResponse.model_validate(config)


@router.put("/{integration_id}", response_model=IntegrationResponse)
async def update_integration(
    integration_id: uuid.UUID,
    payload: IntegrationUpdate,
    project_id: uuid.UUID = Depends(get_project_id),
):
    """Update an integration configuration."""
    async with async_session() as db:
        config = await db.get(IntegrationConfig, integration_id)
        if not config or config.organization_id != project_id:
            raise HTTPException(status_code=404, detail="Integration not found")
        update_data = payload.model_dump(exclude_unset=True)
        for field_name, value in update_data.items():
            setattr(config, field_name, value)
        await db.commit()
        await db.refresh(config)
        return IntegrationResponse.model_validate(config)


@router.delete("/{integration_id}")
async def delete_integration(integration_id: uuid.UUID, project_id: uuid.UUID = Depends(get_project_id)):
    """Delete an integration configuration."""
    async with async_session() as db:
        config = await db.get(IntegrationConfig, integration_id)
        if not config or config.organization_id != project_id:
            raise HTTPException(status_code=404, detail="Integration not found")
        await db.delete(config)
        await db.commit()
        return {"message": "Integration deleted successfully"}


@router.post("/{integration_id}/test", response_model=IntegrationTestResponse)
async def test_integration(integration_id: uuid.UUID, project_id: uuid.UUID = Depends(get_project_id)):
    """Test connectivity for an integration."""
    async with async_session() as db:
        config = await db.get(IntegrationConfig, integration_id)
        if not config or config.organization_id != project_id:
            raise HTTPException(status_code=404, detail="Integration not found")

        integration = IntegrationRegistry.create(
            config.integration_type, config.settings, config.credentials
        )
        success, message = await integration.test_connection()

        config.last_sync_status = "ok" if success else "error"
        config.last_sync_error = None if success else message
        await db.commit()

        return IntegrationTestResponse(success=success, message=message)


@router.get("/{integration_id}/status", response_model=IntegrationStatusResponse)
async def get_integration_status(integration_id: uuid.UUID, project_id: uuid.UUID = Depends(get_project_id)):
    """Get current health/status of an integration."""
    async with async_session() as db:
        config = await db.get(IntegrationConfig, integration_id)
        if not config or config.organization_id != project_id:
            raise HTTPException(status_code=404, detail="Integration not found")

        integration = IntegrationRegistry.create(
            config.integration_type, config.settings, config.credentials
        )
        status = await integration.get_status()
        return IntegrationStatusResponse(
            type=status.get("type", config.integration_type.value),
            connected=status.get("connected", False),
            message=status.get("message", ""),
            details={k: v for k, v in status.items() if k not in ("type", "connected", "message")},
        )


@router.post("/{integration_id}/sync", response_model=IntegrationSyncResponse)
async def sync_call_to_integration(
    integration_id: uuid.UUID,
    payload: IntegrationSyncRequest,
    project_id: uuid.UUID = Depends(get_project_id),
):
    """Manually sync a specific call to an integration."""
    async with async_session() as db:
        config = await db.get(IntegrationConfig, integration_id)
        if not config or config.organization_id != project_id:
            raise HTTPException(status_code=404, detail="Integration not found")
        if not config.is_active:
            raise HTTPException(status_code=400, detail="Integration is disabled")

        call = await db.get(Call, payload.call_id)
        if not call or call.organization_id != project_id:
            raise HTTPException(status_code=404, detail="Call not found")

        call_data = await build_call_sync_data(db, call)
        integration = IntegrationRegistry.create(
            config.integration_type, config.settings, config.credentials
        )
        result = await integration.sync_call(call_data)

        config.last_sync_status = result.get("status", "unknown")
        config.last_sync_error = result.get("error")
        await db.commit()

        return IntegrationSyncResponse(
            integration_id=config.id,
            external_id=result.get("external_id"),
            status=result.get("status", "unknown"),
            details=result,
        )
