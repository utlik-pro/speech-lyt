"""Tests for health and ping endpoints."""

import pytest


@pytest.mark.asyncio
async def test_health(client):
    response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "SpeechLyt"


@pytest.mark.asyncio
async def test_ping(client):
    response = await client.get("/api/v1/ping")
    assert response.status_code == 200
    assert response.json()["message"] == "pong"
