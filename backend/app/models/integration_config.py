import enum
import uuid

from sqlalchemy import Boolean, Enum, ForeignKey, JSON, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDMixin


class IntegrationType(str, enum.Enum):
    ASTERISK = "asterisk"
    FREESWITCH = "freeswitch"
    BITRIX24 = "bitrix24"
    AMOCRM = "amocrm"


class IntegrationConfig(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "integration_configs"

    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    integration_type: Mapped[IntegrationType] = mapped_column(
        Enum(IntegrationType), nullable=False
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    credentials: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    settings: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    last_sync_status: Mapped[str | None] = mapped_column(String(50), nullable=True)
    last_sync_error: Mapped[str | None] = mapped_column(String(1000), nullable=True)

    organization = relationship("Organization", back_populates="integrations")
