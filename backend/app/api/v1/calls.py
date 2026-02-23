import uuid

from datetime import datetime

from fastapi import APIRouter, Depends, File, Form, Query, Request, UploadFile, HTTPException
from fastapi.responses import Response
from sqlalchemy import select, func

from app.api.v1.deps import get_project_id
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

AUDIO_CONTENT_TYPES = {
    "wav": "audio/wav",
    "mp3": "audio/mpeg",
    "ogg": "audio/ogg",
    "flac": "audio/flac",
}

router = APIRouter(prefix="/calls", tags=["calls"])


@router.post("/upload", response_model=CallUploadResponse)
async def upload_call(
    project_id: uuid.UUID = Depends(get_project_id),
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
    audio_url = await storage_service.upload(project_id, file.filename, data)

    # Create call record
    from app.core.database import async_session

    async with async_session() as db:
        call = Call(
            organization_id=project_id,
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
    project_id: uuid.UUID = Depends(get_project_id),
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
            audio_url = await storage_service.upload(project_id, file.filename, data)

            from app.core.database import async_session

            async with async_session() as db:
                call = Call(
                    organization_id=project_id,
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
    project_id: uuid.UUID = Depends(get_project_id),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    status: CallStatus | None = Query(default=None),
    direction: CallDirection | None = Query(default=None),
    agent_id: uuid.UUID | None = Query(default=None, description="Filter by agent"),
    sentiment: str | None = Query(default=None, description="Filter by sentiment: positive/neutral/negative"),
    category: str | None = Query(default=None, description="Filter by category"),
    outcome: str | None = Query(default=None, description="Filter by outcome: resolved/unresolved/escalated/callback"),
    date_from: datetime | None = Query(default=None, description="Filter calls from this date"),
    date_to: datetime | None = Query(default=None, description="Filter calls to this date"),
    search: str | None = Query(default=None, description="Search in transcription text"),
):
    """List calls with pagination and advanced filters."""
    from app.core.database import async_session
    from app.models.emotion import EmotionAnalysis, SentimentType
    from app.models.summary import CallSummary
    from app.models.transcription import Transcription

    async with async_session() as db:
        query = select(Call).where(Call.organization_id == project_id)

        if status:
            query = query.where(Call.status == status)
        if direction:
            query = query.where(Call.direction == direction)
        if agent_id:
            query = query.where(Call.agent_id == agent_id)
        if date_from:
            query = query.where(Call.created_at >= date_from)
        if date_to:
            query = query.where(Call.created_at <= date_to)

        # JOIN-based filters
        if sentiment:
            try:
                sent_enum = SentimentType(sentiment)
            except ValueError:
                sent_enum = None
            if sent_enum:
                query = query.join(EmotionAnalysis, EmotionAnalysis.call_id == Call.id).where(
                    EmotionAnalysis.overall_sentiment == sent_enum
                )

        if category:
            query = query.join(CallSummary, CallSummary.call_id == Call.id).where(
                CallSummary.category == category
            )
        elif outcome:
            query = query.join(CallSummary, CallSummary.call_id == Call.id).where(
                CallSummary.outcome == outcome
            )

        if search:
            query = query.join(Transcription, Transcription.call_id == Call.id).where(
                Transcription.full_text.ilike(f"%{search}%")
            )

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


@router.get("/{call_id}/audio")
async def stream_audio(call_id: uuid.UUID, request: Request):
    """Stream audio file for playback. Supports HTTP Range requests for seeking."""
    from app.core.database import async_session

    async with async_session() as db:
        call = await db.get(Call, call_id)
        if not call:
            raise HTTPException(status_code=404, detail="Call not found")

        try:
            data = await storage_service.download(call.audio_url)
        except Exception:
            raise HTTPException(status_code=404, detail="Audio file not found")

        content_type = AUDIO_CONTENT_TYPES.get(call.audio_format, "application/octet-stream")
        total_size = len(data)

        # Handle Range requests for seeking
        range_header = request.headers.get("range")
        if range_header:
            # Parse "bytes=start-end"
            range_spec = range_header.replace("bytes=", "")
            parts = range_spec.split("-")
            start = int(parts[0]) if parts[0] else 0
            end = int(parts[1]) if parts[1] else total_size - 1
            end = min(end, total_size - 1)
            chunk = data[start : end + 1]

            return Response(
                content=chunk,
                status_code=206,
                headers={
                    "Content-Type": content_type,
                    "Content-Range": f"bytes {start}-{end}/{total_size}",
                    "Accept-Ranges": "bytes",
                    "Content-Length": str(len(chunk)),
                },
            )

        return Response(
            content=data,
            media_type=content_type,
            headers={
                "Accept-Ranges": "bytes",
                "Content-Length": str(total_size),
            },
        )
