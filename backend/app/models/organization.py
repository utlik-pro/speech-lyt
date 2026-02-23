import enum

from sqlalchemy import String
from sqlalchemy.dialects.postgresql import JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDMixin


class OrganizationPlan(str, enum.Enum):
    FREE = "free"
    PRO = "pro"
    ENTERPRISE = "enterprise"


class Organization(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "organizations"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    plan: Mapped[str] = mapped_column(
        String(20), default="free", nullable=False
    )
    settings: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)

    # Relationships
    users: Mapped[list["User"]] = relationship(back_populates="organization")
    agents: Mapped[list["Agent"]] = relationship(back_populates="organization")
    teams: Mapped[list["Team"]] = relationship(back_populates="organization")
    calls: Mapped[list["Call"]] = relationship(back_populates="organization")
    scripts: Mapped[list["Script"]] = relationship(back_populates="organization")
    alert_rules: Mapped[list["AlertRule"]] = relationship(back_populates="organization")
    qa_scorecards: Mapped[list["QAScorecard"]] = relationship(back_populates="organization")
    api_keys: Mapped[list["APIKey"]] = relationship(back_populates="organization")
    webhooks: Mapped[list["Webhook"]] = relationship(back_populates="organization")
    integrations: Mapped[list["IntegrationConfig"]] = relationship(back_populates="organization")
