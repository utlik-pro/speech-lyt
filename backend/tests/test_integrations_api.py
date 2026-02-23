"""Tests for integration API endpoints."""

import pytest


@pytest.mark.asyncio
async def test_list_integration_types(client):
    response = await client.get("/api/v1/integrations/types")
    assert response.status_code == 200
    data = response.json()
    assert "types" in data
    assert "asterisk" in data["types"]
    assert "freeswitch" in data["types"]
    assert "bitrix24" in data["types"]
    assert "amocrm" in data["types"]
    assert len(data["types"]) == 4


@pytest.mark.asyncio
async def test_create_integration_validation(client, headers):
    """Creating integration with invalid type returns 422."""
    response = await client.post(
        "/api/v1/integrations",
        headers=headers,
        json={
            "integration_type": "invalid_type",
            "name": "Test",
        },
    )
    assert response.status_code == 422
