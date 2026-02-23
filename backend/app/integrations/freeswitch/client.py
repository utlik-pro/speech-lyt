"""FreeSWITCH integration via mod_xml_curl / ESL (Event Socket Library)."""

import logging

import httpx

from app.integrations.base import BaseIntegration

logger = logging.getLogger(__name__)


class FreeSwitchIntegration(BaseIntegration):
    """Integration with FreeSWITCH PBX.

    Supports:
    - Fetching CDR via mod_xml_cdr or mod_json_cdr
    - Sending call analysis as custom events via ESL
    - Recording retrieval
    """

    @property
    def api_url(self) -> str:
        return self.credentials.get("api_url", "http://localhost:8080")

    @property
    def esl_host(self) -> str:
        return self.credentials.get("esl_host", "localhost")

    @property
    def esl_port(self) -> int:
        return int(self.credentials.get("esl_port", 8021))

    @property
    def esl_password(self) -> str:
        return self.credentials.get("esl_password", "ClueCon")

    @property
    def api_key(self) -> str:
        return self.credentials.get("api_key", "")

    async def test_connection(self) -> tuple[bool, str]:
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                headers = {}
                if self.api_key:
                    headers["X-API-Key"] = self.api_key
                response = await client.get(
                    f"{self.api_url}/api/status",
                    headers=headers,
                )
                if response.status_code == 200:
                    return True, f"Connected to FreeSWITCH at {self.api_url}"
                return False, f"HTTP {response.status_code}: {response.text}"
        except httpx.TimeoutException:
            return False, "Connection timed out"
        except Exception as e:
            return False, f"Connection failed: {e}"

    async def sync_call(self, call_data: dict) -> dict:
        """Send call analysis to FreeSWITCH via REST API / mod_xml_curl."""
        call_uuid = call_data.get("external_id") or call_data.get("call_id")
        payload = {
            "call_uuid": call_uuid,
            "speechlyt_call_id": call_data.get("call_id"),
            "sentiment": call_data.get("sentiment"),
            "category": call_data.get("category"),
            "summary": call_data.get("summary"),
            "score": call_data.get("score"),
        }

        try:
            headers = {}
            if self.api_key:
                headers["X-API-Key"] = self.api_key
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(
                    f"{self.api_url}/api/speechlyt/sync",
                    headers=headers,
                    json=payload,
                )
                return {
                    "external_id": call_uuid,
                    "status": "synced" if response.status_code in (200, 201, 204) else "failed",
                    "http_status": response.status_code,
                }
        except Exception as e:
            logger.warning(f"FreeSWITCH sync failed for {call_uuid}: {e}")
            return {"external_id": call_uuid, "status": "failed", "error": str(e)}

    async def fetch_call_metadata(self, external_id: str) -> dict | None:
        """Fetch CDR from FreeSWITCH for the given call UUID."""
        try:
            headers = {}
            if self.api_key:
                headers["X-API-Key"] = self.api_key
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(
                    f"{self.api_url}/api/cdr/{external_id}",
                    headers=headers,
                )
                if response.status_code == 200:
                    data = response.json()
                    return {
                        "uuid": data.get("call_uuid"),
                        "caller_id": data.get("caller_id_number"),
                        "caller_name": data.get("caller_id_name"),
                        "destination": data.get("destination_number"),
                        "direction": data.get("direction"),
                        "start_time": data.get("start_stamp"),
                        "end_time": data.get("end_stamp"),
                        "duration": data.get("duration"),
                        "billsec": data.get("billsec"),
                        "hangup_cause": data.get("hangup_cause"),
                    }
                return None
        except Exception as e:
            logger.warning(f"FreeSWITCH CDR fetch failed for {external_id}: {e}")
            return None

    async def get_status(self) -> dict:
        success, message = await self.test_connection()
        return {
            "type": "freeswitch",
            "connected": success,
            "message": message,
            "api_url": self.api_url,
        }
