import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import create_access_token, hash_password, verify_password
from app.api.v1.deps import get_current_user, get_project_id
from app.models.user import User
from app.schemas.user import (
    TokenResponse,
    UserLogin,
    UserRegister,
    UserResponse,
    UserUpdate,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse)
async def register(
    payload: UserRegister,
    organization_id: uuid.UUID = Depends(get_project_id),
    db: AsyncSession = Depends(get_db),
):
    # Check if email already exists
    existing = await db.execute(
        select(User).where(User.email == payload.email.lower())
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Email already registered")

    user = User(
        organization_id=organization_id,
        email=payload.email.lower(),
        password_hash=hash_password(payload.password),
        name=payload.name,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(
        access_token=token,
        user=UserResponse.model_validate(user),
    )


@router.post("/login", response_model=TokenResponse)
async def login(
    payload: UserLogin,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(User).where(User.email == payload.email.lower())
    )
    user = result.scalar_one_or_none()

    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated")

    user.last_login_at = datetime.now(timezone.utc)
    await db.commit()

    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(
        access_token=token,
        user=UserResponse.model_validate(user),
    )


@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user: User = Depends(get_current_user),
):
    return UserResponse.model_validate(current_user)


@router.put("/me", response_model=UserResponse)
async def update_me(
    payload: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if payload.name is not None:
        current_user.name = payload.name
    if payload.email is not None:
        # Check uniqueness
        existing = await db.execute(
            select(User).where(
                User.email == payload.email.lower(),
                User.id != current_user.id,
            )
        )
        if existing.scalar_one_or_none():
            raise HTTPException(status_code=409, detail="Email already in use")
        current_user.email = payload.email.lower()
    if payload.password is not None:
        current_user.password_hash = hash_password(payload.password)

    await db.commit()
    await db.refresh(current_user)
    return UserResponse.model_validate(current_user)
