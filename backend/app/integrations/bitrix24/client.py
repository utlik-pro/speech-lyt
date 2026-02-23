"""Bitrix24 CRM integration via REST API / incoming webhook."""

import logging

import httpx

from app.integrations.base import BaseIntegration

logger = logging.getLogger(__name__)


class Bitrix24Integration(BaseIntegration):
    """Integration with Bitrix24 CRM.

    Supports:
    - Creating/updating activities with call analysis
    - Linking calls to CRM contacts/deals
    - Posting timeline comments with call summaries
    """

    @property
    def webhook_url(self) -> str:
        """Bitrix24 incoming webhook URL (includes auth token)."""
        return self.credentials.get("webhook_url", "").rstrip("/")

    async def _api_call(self, method: str, params: dict | None = None) -> dict | None:
        """Make a Bitrix24 REST API call."""
        url = f"{self.webhook_url}/{method}"
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.post(url, json=params or {})
                if response.status_code == 200:
                    data = response.json()
                    if "error" in data:
                        logger.warning(f"Bitrix24 API error: {data['error']} - {data.get('error_description')}")
                        return None
                    return data.get("result", data)
                logger.warning(f"Bitrix24 API HTTP {response.status_code}: {response.text[:200]}")
                return None
        except Exception as e:
            logger.warning(f"Bitrix24 API call failed ({method}): {e}")
            return None

    async def test_connection(self) -> tuple[bool, str]:
        if not self.webhook_url:
            return False, "Webhook URL not configured"

        result = await self._api_call("profile")
        if result:
            name = f"{result.get('NAME', '')} {result.get('LAST_NAME', '')}".strip()
            return True, f"Connected as {name or 'Bitrix24 user'}"
        return False, "Failed to connect to Bitrix24"

    async def sync_call(self, call_data: dict) -> dict:
        """Create a telephony call record and attach analysis in Bitrix24."""
        call_id = call_data.get("call_id", "")

        # 1. Register the call in telephony
        register_params = {
            "USER_PHONE_INNER": call_data.get("agent_phone", ""),
            "USER_ID": call_data.get("bitrix_user_id", 1),
            "PHONE_NUMBER": call_data.get("phone_number", ""),
            "TYPE": 1 if call_data.get("direction") == "inbound" else 2,
            "CRM_CREATE": self.config.get("crm_auto_create", False),
        }
        register_result = await self._api_call("telephony.externalcall.register", register_params)

        external_call_id = None
        if register_result:
            external_call_id = register_result.get("CALL_ID")

        # 2. Finish the call with duration and analysis data
        if external_call_id:
            finish_params = {
                "CALL_ID": external_call_id,
                "USER_ID": call_data.get("bitrix_user_id", 1),
                "DURATION": int(call_data.get("duration_seconds", 0)),
                "STATUS_CODE": "200",
                "ADD_TO_CHAT": 0,
            }
            await self._api_call("telephony.externalcall.finish", finish_params)

        # 3. Add a timeline comment with analysis summary
        crm_entity_id = call_data.get("crm_entity_id")
        crm_entity_type = call_data.get("crm_entity_type", "CONTACT")
        if crm_entity_id:
            comment_text = self._build_comment(call_data)
            comment_params = {
                "fields": {
                    "ENTITY_ID": crm_entity_id,
                    "ENTITY_TYPE": crm_entity_type,
                    "COMMENT": comment_text,
                }
            }
            await self._api_call("crm.timeline.comment.add", comment_params)

        return {
            "external_id": external_call_id or call_id,
            "status": "synced" if external_call_id else "partial",
            "bitrix_call_id": external_call_id,
        }

    async def fetch_call_metadata(self, external_id: str) -> dict | None:
        """Search Bitrix24 CRM for call/activity by external ID."""
        params = {
            "filter": {"ORIGIN_ID": external_id},
            "select": ["ID", "SUBJECT", "DIRECTION", "START_TIME", "END_TIME", "RESPONSIBLE_ID"],
        }
        result = await self._api_call("crm.activity.list", params)
        if result and isinstance(result, list) and len(result) > 0:
            activity = result[0]
            return {
                "activity_id": activity.get("ID"),
                "subject": activity.get("SUBJECT"),
                "direction": activity.get("DIRECTION"),
                "start_time": activity.get("START_TIME"),
                "end_time": activity.get("END_TIME"),
                "responsible_id": activity.get("RESPONSIBLE_ID"),
            }
        return None

    async def search_contact(self, phone: str) -> dict | None:
        """Search Bitrix24 for a contact by phone number."""
        result = await self._api_call(
            "crm.contact.list",
            {"filter": {"PHONE": phone}, "select": ["ID", "NAME", "LAST_NAME", "COMPANY_ID"]},
        )
        if result and isinstance(result, list) and len(result) > 0:
            return result[0]
        return None

    async def get_status(self) -> dict:
        success, message = await self.test_connection()
        return {
            "type": "bitrix24",
            "connected": success,
            "message": message,
        }

    @staticmethod
    def _build_comment(call_data: dict) -> str:
        """Build a human-readable comment from call analysis data."""
        lines = ["[B]SpeechLyt - Call Analysis[/B]\n"]
        if call_data.get("summary"):
            lines.append(f"[B]Summary:[/B] {call_data['summary']}")
        if call_data.get("sentiment"):
            lines.append(f"[B]Sentiment:[/B] {call_data['sentiment']}")
        if call_data.get("category"):
            lines.append(f"[B]Category:[/B] {call_data['category']}")
        if call_data.get("score") is not None:
            lines.append(f"[B]Score:[/B] {call_data['score']}")
        if call_data.get("duration_seconds"):
            mins = int(call_data["duration_seconds"]) // 60
            secs = int(call_data["duration_seconds"]) % 60
            lines.append(f"[B]Duration:[/B] {mins}m {secs}s")
        return "\n".join(lines)
