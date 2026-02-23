"""Base integration interface for all external service integrations."""

import logging
from abc import ABC, abstractmethod

logger = logging.getLogger(__name__)


class BaseIntegration(ABC):
    """Abstract base class for IP telephony and CRM integrations."""

    def __init__(self, config: dict, credentials: dict):
        self.config = config
        self.credentials = credentials

    @abstractmethod
    async def test_connection(self) -> tuple[bool, str]:
        """Test connectivity to the external service.

        Returns:
            Tuple of (success, message).
        """

    @abstractmethod
    async def sync_call(self, call_data: dict) -> dict:
        """Send completed call analysis data to the external service.

        Args:
            call_data: Call data including transcription, sentiment, summary.

        Returns:
            Dict with sync result (external_id, status, etc.).
        """

    @abstractmethod
    async def fetch_call_metadata(self, external_id: str) -> dict | None:
        """Retrieve call metadata from the external service by its ID.

        Args:
            external_id: ID of the call in the external system.

        Returns:
            Dict with call metadata or None if not found.
        """

    @abstractmethod
    async def get_status(self) -> dict:
        """Get current integration health/status.

        Returns:
            Dict with status information.
        """
