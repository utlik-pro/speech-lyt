import uuid

from fastapi import APIRouter, File, Form, Query, UploadFile, HTTPException
from sqlalchemy import select, func

from app.core.database import get_db
from app.models.call import Call, CallDirection, CallStatus
from app.schemas.call import (
    CallBatchUploadResponse,
    CallListResponse,
    CallResponse,
    CallUploadResponse,
)
from app.services.audio import audio_service
from app.services.storage import storage_service

router = APIRouter(prefix="/calls", tags=["calls"])

# Temporary hardcoded org_id until auth is implemented
TEMP_ORG_ID = uuid.UUID("00000000-0000-0000-0000-000000000001")


@router.post("/upload", response_model=CallUploadResponse)
async def upload_call(
    file: UploadFile = File(...),
    direction: CallDirection = Form(default=CallDirection.UNKNOWN),
    phone_number: str | None = Form(default=None),
    agent_id: uuid.UUID | None = Form(default=None),
    external_id: str | None = Form(default=None),
):
    """Upload a single audio file for analysis."""
    # Validate format
    fmt = audio_service.validate_format(file.filename)

    # Read file
    data = await file.read()

    # Validate size
    audio_service.validate_size(len(data))

    # Get audio info
    try:
        info = audio_service.get_audio_info(data, fmt)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid audio file: {e}")

    # Upload to storage
    audio_url = await storage_service.upload(TEMP_ORG_ID, file.filename, data)

    # Create call record
    from app.core.database import async_session

    async with async_session() as db:
        call = Call(
            organization_id=TEMP_ORG_ID,
            agent_id=agent_id,
            external_id=external_id,
            audio_url=audio_url,
            original_filename=file.filename,
            audio_format=fmt,
            file_size_bytes=len(data),
            duration_seconds=info.duration_seconds,
            sample_rate=info.sample_rate,
            channels=info.channels,
            direction=direction,
            phone_number=phone_number,
            status=CallStatus.PENDING,
        )
        db.add(call)
        await db.commit()
        await db.refresh(call)

        # Dispatch Celery task for ASR processing
        try:
            from app.workers.tasks import process_call
            process_call.delay(str(call.id))
        except Exception:
            pass  # Celery may not be running in dev mode

        return CallUploadResponse(
            id=call.id,
            status=call.status,
            message="File uploaded successfully, processing will start shortly",
        )


@router.post("/upload/batch", response_model=CallBatchUploadResponse)
async def upload_calls_batch(
    files: list[UploadFile] = File(...),
    direction: CallDirection = Form(default=CallDirection.UNKNOWN),
):
    """Upload multiple audio files at once (up to 100)."""
    if len(files) > 100:
        raise HTTPException(status_code=400, detail="Maximum 100 files per batch upload")

    results = []
    errors = []

    for file in files:
        try:
            fmt = audio_service.validate_format(file.filename)
            data = await file.read()
            audio_service.validate_size(len(data))
            info = audio_service.get_audio_info(data, fmt)
            audio_url = await storage_service.upload(TEMP_ORG_ID, file.filename, data)

            from app.core.database import async_session

            async with async_session() as db:
                call = Call(
                    organization_id=TEMP_ORG_ID,
                    audio_url=audio_url,
                    original_filename=file.filename,
                    audio_format=fmt,
                    file_size_bytes=len(data),
                    duration_seconds=info.duration_seconds,
                    sample_rate=info.sample_rate,
                    channels=info.channels,
                    direction=direction,
                    status=CallStatus.PENDING,
                )
                db.add(call)
                await db.commit()
                await db.refresh(call)

                # Dispatch Celery task
                try:
                    from app.workers.tasks import process_call
                    process_call.delay(str(call.id))
                except Exception:
                    pass  # Celery may not be running in dev mode

                results.append(CallUploadResponse(id=call.id, status=call.status))
        except Exception as e:
            errors.append(f"{file.filename}: {e}")

    return CallBatchUploadResponse(
        uploaded=len(results),
        failed=len(errors),
        calls=results,
        errors=errors,
    )


@router.get("", response_model=CallListResponse)
async def list_calls(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    status: CallStatus | None = Query(default=None),
    direction: CallDirection | None = Query(default=None),
):
    """List calls with pagination and filters."""
    from app.core.database import async_session

    async with async_session() as db:
        query = select(Call).where(Call.organization_id == TEMP_ORG_ID)

        if status:
            query = query.where(Call.status == status)
        if direction:
            query = query.where(Call.direction == direction)

        # Count total
        count_query = select(func.count()).select_from(query.subquery())
        total = (await db.execute(count_query)).scalar() or 0

        # Paginate
        query = query.order_by(Call.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
        result = await db.execute(query)
        calls = result.scalars().all()

        return CallListResponse(
            items=[CallResponse.model_validate(c) for c in calls],
            total=total,
            page=page,
            page_size=page_size,
        )


@router.get("/{call_id}", response_model=CallResponse)
async def get_call(call_id: uuid.UUID):
    """Get call details by ID."""
    from app.core.database import async_session

    async with async_session() as db:
        call = await db.get(Call, call_id)
        if not call:
            raise HTTPException(status_code=404, detail="Call not found")
        return CallResponse.model_validate(call)


@router.delete("/{call_id}")
async def delete_call(call_id: uuid.UUID):
    """Delete a call and its audio file."""
    from app.core.database import async_session

    async with async_session() as db:
        call = await db.get(Call, call_id)
        if not call:
            raise HTTPException(status_code=404, detail="Call not found")

        await storage_service.delete(call.audio_url)
        await db.delete(call)
        await db.commit()

        return {"message": "Call deleted successfully"}
