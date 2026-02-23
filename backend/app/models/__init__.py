from app.models.manager import Manager
from app.models.ai_agent import AIAgent, AIAgentPrompt, AIAgentRun
from app.models.alert import AlertHistory, AlertRule
from app.models.api_key import APIKey
from app.models.audit_log import AuditLog
from app.models.base import Base
from app.models.call import Call, CallDirection, CallStatus
from app.models.call_kpi import CallKPI
from app.models.coaching import CoachingInsight
from app.models.emotion import EmotionAnalysis, SentimentType
from app.models.integration_config import IntegrationConfig, IntegrationType
from app.models.organization import Organization, OrganizationPlan
from app.models.project import Project
from app.models.qa import QAEvaluation, QAScorecard
from app.models.script import Script, ScriptAnalysis, ScriptStage, ScriptType
from app.models.summary import CallSummary
from app.models.team import Team
from app.models.transcription import Transcription
from app.models.user import User, UserRole
from app.models.webhook import Webhook

# Backward-compatible alias
Agent = Manager

__all__ = [
    "Manager",
    "Agent",
    "AIAgent",
    "AIAgentPrompt",
    "AIAgentRun",
    "AlertHistory",
    "AlertRule",
    "APIKey",
    "AuditLog",
    "Base",
    "Call",
    "CallDirection",
    "CallKPI",
    "CallStatus",
    "CallSummary",
    "CoachingInsight",
    "EmotionAnalysis",
    "IntegrationConfig",
    "IntegrationType",
    "Organization",
    "OrganizationPlan",
    "Project",
    "QAEvaluation",
    "QAScorecard",
    "Script",
    "ScriptAnalysis",
    "ScriptStage",
    "ScriptType",
    "SentimentType",
    "Team",
    "Transcription",
    "User",
    "UserRole",
    "Webhook",
]
