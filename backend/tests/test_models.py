"""Tests for model imports and basic instantiation."""

import uuid

import pytest


def test_all_models_importable():
    """Verify all models can be imported from the models package."""
    from app.models import (
        Agent,
        AlertHistory,
        AlertRule,
        APIKey,
        AuditLog,
        Base,
        Call,
        CallDirection,
        CallKPI,
        CallStatus,
        CallSummary,
        EmotionAnalysis,
        IntegrationConfig,
        IntegrationType,
        Organization,
        OrganizationPlan,
        Project,
        QAEvaluation,
        QAScorecard,
        Script,
        ScriptAnalysis,
        ScriptStage,
        ScriptType,
        SentimentType,
        Team,
        Transcription,
        User,
        UserRole,
        Webhook,
    )

    assert Base is not None
    assert Organization.__tablename__ == "organizations"
    assert Team.__tablename__ == "teams"
    assert CallKPI.__tablename__ == "call_kpis"
    assert IntegrationConfig.__tablename__ == "integration_configs"


def test_organization_plan_enum():
    from app.models import OrganizationPlan

    assert OrganizationPlan.FREE == "free"
    assert OrganizationPlan.PRO == "pro"
    assert OrganizationPlan.ENTERPRISE == "enterprise"


def test_integration_type_enum():
    from app.models import IntegrationType

    assert IntegrationType.ASTERISK == "asterisk"
    assert IntegrationType.FREESWITCH == "freeswitch"
    assert IntegrationType.BITRIX24 == "bitrix24"
    assert IntegrationType.AMOCRM == "amocrm"


def test_call_status_enum():
    from app.models import CallStatus

    assert CallStatus.PENDING.value == "pending"
    assert CallStatus.COMPLETED.value == "completed"


def test_sentiment_type_enum():
    from app.models import SentimentType

    assert SentimentType.POSITIVE.value == "positive"
    assert SentimentType.NEGATIVE.value == "negative"
    assert SentimentType.NEUTRAL.value == "neutral"
