"""Asterisk PBX integration via ARI (Asterisk REST Interface) and CDR."""

import logging

import httpx

from app.integrations.base import BaseIntegration

logger = logging.getLogger(__name__)


class AsteriskIntegration(BaseIntegration):
    """Integration with Asterisk PBX.

    Supports:
    - Fetching CDR (Call Detail Records) for call metadata
    - Posting call analysis results back to Asterisk via ARI
    - Recording retrieval from Asterisk recording storage
    """

    @property
    def base_url(self) -> str:
        return self.credentials.get("api_url", "http://localhost:8088")

    @property
    def ari_url(self) -> str:
        return f"{self.base_url}/ari"

    @property
    def auth(self) -> tuple[str, str]:
        return (
            self.credentials.get("username", ""),
            self.credentials.get("password", ""),
        )

    async def test_connection(self) -> tuple[bool, str]:
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(
                    f"{self.ari_url}/asterisk/info",
                    auth=self.auth,
                )
                if response.status_code == 200:
                    info = response.json()
                    version = info.get("system", {}).get("version", "unknown")
                    return True, f"Connected to Asterisk {version}"
                return False, f"HTTP {response.status_code}: {response.text}"
        except httpx.TimeoutException:
            return False, "Connection timed out"
        except Exception as e:
            return False, f"Connection failed: {e}"

    async def sync_call(self, call_data: dict) -> dict:
        """Post call analysis to Asterisk as a channel variable or CDR update."""
        unique_id = call_data.get("external_id") or call_data.get("call_id")
        payload = {
            "variable": "SPEECHLYT_ANALYSIS",
            "value": {
                "call_id": call_data.get("call_id"),
                "sentiment": call_data.get("sentiment"),
                "category": call_data.get("category"),
                "summary": call_data.get("summary"),
                "score": call_data.get("score"),
            },
        }

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                # Try to update channel variable via ARI
                response = await client.post(
                    f"{self.ari_url}/channels/{unique_id}/variable",
                    auth=self.auth,
                    json=payload,
                )
                return {
                    "external_id": unique_id,
                    "status": "synced" if response.status_code in (200, 204) else "failed",
                    "http_status": response.status_code,
                }
        except Exception as e:
            logger.warning(f"Asterisk sync failed for {unique_id}: {e}")
            return {"external_id": unique_id, "status": "failed", "error": str(e)}

    async def fetch_call_metadata(self, external_id: str) -> dict | None:
        """Fetch CDR record from Asterisk for the given UniqueID."""
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                # Query ARI for channel details
                response = await client.get(
                    f"{self.ari_url}/channels/{external_id}",
                    auth=self.auth,
                )
                if response.status_code == 200:
                    data = response.json()
                    return {
                        "unique_id": data.get("id"),
                        "caller_id": data.get("caller", {}).get("number"),
                        "caller_name": data.get("caller", {}).get("name"),
                        "connected_number": data.get("connected", {}).get("number"),
                        "state": data.get("state"),
                        "created_at": data.get("creationtime"),
                        "dialplan": data.get("dialplan", {}),
                    }
                return None
        except Exception as e:
            logger.warning(f"Asterisk CDR fetch failed for {external_id}: {e}")
            return None

    async def fetch_recording(self, recording_name: str) -> bytes | None:
        """Download a recording file from Asterisk."""
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(
                    f"{self.ari_url}/recordings/stored/{recording_name}/file",
                    auth=self.auth,
                )
                if response.status_code == 200:
                    return response.content
                return None
        except Exception as e:
            logger.warning(f"Recording download failed for {recording_name}: {e}")
            return None

    async def get_status(self) -> dict:
        success, message = await self.test_connection()
        return {
            "type": "asterisk",
            "connected": success,
            "message": message,
            "api_url": self.base_url,
        }
