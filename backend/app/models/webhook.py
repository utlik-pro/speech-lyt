import uuid

from sqlalchemy import Boolean, String, Text
from sqlalchemy.dialects.postgresql import JSON, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin, UUIDMixin


class Webhook(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "webhooks"

    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), nullable=False, index=True
    )
    url: Mapped[str] = mapped_column(Text, nullable=False)
    events: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    secret: Mapped[str] = mapped_column(String(255), nullable=False)
