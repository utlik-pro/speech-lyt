"""Tests for the integration registry and base classes."""

import pytest

from app.integrations.amocrm.client import AmoCRMIntegration
from app.integrations.asterisk.client import AsteriskIntegration
from app.integrations.bitrix24.client import Bitrix24Integration
from app.integrations.freeswitch.client import FreeSwitchIntegration
from app.integrations.registry import IntegrationRegistry
from app.models.integration_config import IntegrationType


def test_registry_supported_types():
    types = IntegrationRegistry.supported_types()
    assert "asterisk" in types
    assert "freeswitch" in types
    assert "bitrix24" in types
    assert "amocrm" in types


def test_registry_create_asterisk():
    integration = IntegrationRegistry.create(
        IntegrationType.ASTERISK,
        config={},
        credentials={"api_url": "http://localhost:8088", "username": "admin", "password": "secret"},
    )
    assert isinstance(integration, AsteriskIntegration)
    assert integration.base_url == "http://localhost:8088"


def test_registry_create_freeswitch():
    integration = IntegrationRegistry.create(
        IntegrationType.FREESWITCH,
        config={},
        credentials={"api_url": "http://localhost:8080", "esl_password": "ClueCon"},
    )
    assert isinstance(integration, FreeSwitchIntegration)
    assert integration.api_url == "http://localhost:8080"


def test_registry_create_bitrix24():
    integration = IntegrationRegistry.create(
        IntegrationType.BITRIX24,
        config={},
        credentials={"webhook_url": "https://mycompany.bitrix24.ru/rest/1/abc123/"},
    )
    assert isinstance(integration, Bitrix24Integration)
    assert "mycompany.bitrix24.ru" in integration.webhook_url


def test_registry_create_amocrm():
    integration = IntegrationRegistry.create(
        IntegrationType.AMOCRM,
        config={},
        credentials={"subdomain": "mycompany", "access_token": "test-token"},
    )
    assert isinstance(integration, AmoCRMIntegration)
    assert "mycompany.amocrm.ru" in integration.base_url


def test_registry_unknown_type():
    with pytest.raises(ValueError, match="Unknown integration type"):
        IntegrationRegistry.create("unknown", config={}, credentials={})


@pytest.mark.asyncio
async def test_asterisk_test_connection_timeout():
    integration = AsteriskIntegration(
        config={}, credentials={"api_url": "http://192.0.2.1:9999"}
    )
    success, message = await integration.test_connection()
    assert success is False


@pytest.mark.asyncio
async def test_freeswitch_test_connection_timeout():
    integration = FreeSwitchIntegration(
        config={}, credentials={"api_url": "http://192.0.2.1:9999"}
    )
    success, message = await integration.test_connection()
    assert success is False


@pytest.mark.asyncio
async def test_bitrix24_test_connection_no_url():
    integration = Bitrix24Integration(config={}, credentials={})
    success, message = await integration.test_connection()
    assert success is False
    assert "not configured" in message


@pytest.mark.asyncio
async def test_amocrm_test_connection_no_creds():
    integration = AmoCRMIntegration(config={}, credentials={})
    success, message = await integration.test_connection()
    assert success is False
    assert "required" in message
