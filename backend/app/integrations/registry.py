"""Integration registry — factory for creating integration instances by type."""

import logging

from app.integrations.amocrm.client import AmoCRMIntegration
from app.integrations.asterisk.client import AsteriskIntegration
from app.integrations.base import BaseIntegration
from app.integrations.bitrix24.client import Bitrix24Integration
from app.integrations.freeswitch.client import FreeSwitchIntegration
from app.models.integration_config import IntegrationType

logger = logging.getLogger(__name__)

_REGISTRY: dict[IntegrationType, type[BaseIntegration]] = {
    IntegrationType.ASTERISK: AsteriskIntegration,
    IntegrationType.FREESWITCH: FreeSwitchIntegration,
    IntegrationType.BITRIX24: Bitrix24Integration,
    IntegrationType.AMOCRM: AmoCRMIntegration,
}


class IntegrationRegistry:
    """Factory for building integration instances from DB config."""

    @staticmethod
    def create(integration_type: IntegrationType, config: dict, credentials: dict) -> BaseIntegration:
        cls = _REGISTRY.get(integration_type)
        if cls is None:
            raise ValueError(f"Unknown integration type: {integration_type}")
        return cls(config=config, credentials=credentials)

    @staticmethod
    def supported_types() -> list[str]:
        return [t.value for t in IntegrationType]
