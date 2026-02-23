import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

from app.models.user import UserRole


class UserRegister(BaseModel):
    email: str = Field(..., min_length=3, max_length=255)
    password: str = Field(..., min_length=6, max_length=128)
    name: str = Field(..., min_length=1, max_length=255)


class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: uuid.UUID
    organization_id: uuid.UUID
    email: str
    name: str
    role: UserRole
    is_active: bool
    agent_id: uuid.UUID | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class UserUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    email: str | None = Field(default=None, min_length=3, max_length=255)
    password: str | None = Field(default=None, min_length=6, max_length=128)
