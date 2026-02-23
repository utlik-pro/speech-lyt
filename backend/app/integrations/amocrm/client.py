"""amoCRM integration via REST API v4."""

import logging
from datetime import datetime, timezone

import httpx

from app.integrations.base import BaseIntegration

logger = logging.getLogger(__name__)


class AmoCRMIntegration(BaseIntegration):
    """Integration with amoCRM.

    Supports:
    - Creating call notes on contacts/leads
    - Linking call analysis to CRM entities
    - Contact search by phone number
    """

    @property
    def base_url(self) -> str:
        """amoCRM API base URL: https://{subdomain}.amocrm.ru/api/v4."""
        subdomain = self.credentials.get("subdomain", "")
        return f"https://{subdomain}.amocrm.ru/api/v4"

    @property
    def access_token(self) -> str:
        return self.credentials.get("access_token", "")

    @property
    def _headers(self) -> dict:
        return {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json",
        }

    async def _api_call(
        self, method: str, path: str, params: dict | None = None, json_data: dict | list | None = None
    ) -> dict | list | None:
        url = f"{self.base_url}/{path}"
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                if method == "GET":
                    response = await client.get(url, headers=self._headers, params=params)
                elif method == "POST":
                    response = await client.post(url, headers=self._headers, json=json_data)
                elif method == "PATCH":
                    response = await client.patch(url, headers=self._headers, json=json_data)
                else:
                    return None

                if response.status_code in (200, 201):
                    return response.json()
                if response.status_code == 204:
                    return {}
                logger.warning(f"amoCRM API {method} {path} HTTP {response.status_code}: {response.text[:200]}")
                return None
        except Exception as e:
            logger.warning(f"amoCRM API call failed ({method} {path}): {e}")
            return None

    async def test_connection(self) -> tuple[bool, str]:
        if not self.credentials.get("subdomain") or not self.access_token:
            return False, "Subdomain and access token required"

        result = await self._api_call("GET", "account", params={"with": "version"})
        if result:
            name = result.get("name", "Unknown")
            return True, f"Connected to amoCRM account: {name}"
        return False, "Failed to connect to amoCRM"

    async def sync_call(self, call_data: dict) -> dict:
        """Create a call note in amoCRM linked to a contact or lead."""
        call_id = call_data.get("call_id", "")
        phone = call_data.get("phone_number", "")

        # 1. Find contact by phone
        contact_id = call_data.get("crm_entity_id")
        if not contact_id and phone:
            contact = await self.search_contact(phone)
            if contact:
                contact_id = contact.get("id")

        if not contact_id:
            return {
                "external_id": call_id,
                "status": "skipped",
                "reason": "No matching contact found",
            }

        # 2. Create a note with call analysis
        note_text = self._build_note(call_data)
        now_ts = int(datetime.now(timezone.utc).timestamp())
        duration = int(call_data.get("duration_seconds", 0))

        notes_payload = [
            {
                "note_type": "call_in" if call_data.get("direction") == "inbound" else "call_out",
                "params": {
                    "uniq": call_id,
                    "duration": duration,
                    "source": "SpeechLyt",
                    "phone": phone,
                },
                "text": note_text,
                "created_at": now_ts,
            }
        ]

        result = await self._api_call(
            "POST", f"contacts/{contact_id}/notes", json_data=notes_payload
        )

        if result:
            note_id = None
            embedded = result.get("_embedded", {})
            notes = embedded.get("notes", [])
            if notes:
                note_id = notes[0].get("id")
            return {
                "external_id": str(note_id or call_id),
                "status": "synced",
                "contact_id": contact_id,
                "note_id": note_id,
            }

        return {"external_id": call_id, "status": "failed", "contact_id": contact_id}

    async def fetch_call_metadata(self, external_id: str) -> dict | None:
        """Fetch note/call data from amoCRM by note ID."""
        # amoCRM doesn't provide direct note fetch, search by contact notes
        return None

    async def search_contact(self, phone: str) -> dict | None:
        """Search amoCRM contacts by phone number."""
        result = await self._api_call("GET", "contacts", params={"query": phone})
        if result:
            embedded = result.get("_embedded", {})
            contacts = embedded.get("contacts", [])
            if contacts:
                return contacts[0]
        return None

    async def search_lead(self, query: str) -> dict | None:
        """Search amoCRM leads by query string."""
        result = await self._api_call("GET", "leads", params={"query": query})
        if result:
            embedded = result.get("_embedded", {})
            leads = embedded.get("leads", [])
            if leads:
                return leads[0]
        return None

    async def get_status(self) -> dict:
        success, message = await self.test_connection()
        return {
            "type": "amocrm",
            "connected": success,
            "message": message,
            "subdomain": self.credentials.get("subdomain"),
        }

    @staticmethod
    def _build_note(call_data: dict) -> str:
        """Build note text from call analysis data."""
        lines = ["SpeechLyt - Call Analysis"]
        if call_data.get("summary"):
            lines.append(f"Summary: {call_data['summary']}")
        if call_data.get("sentiment"):
            lines.append(f"Sentiment: {call_data['sentiment']}")
        if call_data.get("category"):
            lines.append(f"Category: {call_data['category']}")
        if call_data.get("score") is not None:
            lines.append(f"Score: {call_data['score']}")
        return "\n".join(lines)
