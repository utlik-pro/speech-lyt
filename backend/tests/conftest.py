"""Shared test fixtures."""

import uuid
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest.fixture
def test_org_id():
    return uuid.UUID("00000000-0000-0000-0000-000000000001")


@pytest.fixture
def test_agent_id():
    return uuid.UUID("00000000-0000-0000-0000-000000000010")


@pytest.fixture
def test_call_id():
    return uuid.UUID("00000000-0000-0000-0000-000000000100")


@pytest.fixture
async def client():
    """Async HTTP client for testing FastAPI app."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c


@pytest.fixture
def headers(test_org_id):
    """Default request headers with project ID."""
    return {"X-Project-Id": str(test_org_id)}
