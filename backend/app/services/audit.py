import logging
import uuid

from app.core.database import async_session
from app.models.audit_log import AuditLog

logger = logging.getLogger(__name__)


class AuditService:
    """Service for logging audit events to the database."""

    async def log(
        self,
        organization_id: uuid.UUID,
        action: str,
        resource_type: str,
        resource_id: str | None = None,
        user_id: uuid.UUID | None = None,
        details: dict | None = None,
        ip_address: str | None = None,
    ) -> AuditLog:
        """Create an audit log entry.

        Args:
            organization_id: The organization performing the action.
            action: The action being performed (e.g. "api_key.created", "call.uploaded").
            resource_type: The type of resource acted upon (e.g. "api_key", "call").
            resource_id: The ID of the specific resource (optional).
            user_id: The user performing the action (optional, for future auth).
            details: Additional JSON details about the action (optional).
            ip_address: The IP address of the requester (optional).

        Returns:
            The created AuditLog record.
        """
        try:
            async with async_session() as db:
                entry = AuditLog(
                    organization_id=organization_id,
                    user_id=user_id,
                    action=action,
                    resource_type=resource_type,
                    resource_id=resource_id,
                    details=details,
                    ip_address=ip_address,
                )
                db.add(entry)
                await db.commit()
                await db.refresh(entry)
                return entry
        except Exception:
            logger.exception("Failed to write audit log entry")
            raise


audit_service = AuditService()
