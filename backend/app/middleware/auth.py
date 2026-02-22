import hashlib
import secrets
from datetime import datetime, timezone

from fastapi import Header, HTTPException, status
from sqlalchemy import select

from app.core.database import async_session
from app.models.api_key import APIKey


def generate_api_key() -> str:
    """Generate a random API key string (returned to user once, then only stored as hash)."""
    return f"sk-{secrets.token_hex(32)}"


def hash_api_key(raw_key: str) -> str:
    """Hash an API key using SHA-256 for storage."""
    return hashlib.sha256(raw_key.encode("utf-8")).hexdigest()


async def verify_api_key(x_api_key: str = Header(..., alias="X-API-Key")) -> APIKey:
    """FastAPI dependency that validates the X-API-Key header against hashed keys in DB.

    Returns the APIKey model instance if valid, or raises 401/403.
    """
    key_hash = hash_api_key(x_api_key)

    async with async_session() as db:
        result = await db.execute(
            select(APIKey).where(APIKey.key_hash == key_hash)
        )
        api_key = result.scalar_one_or_none()

        if api_key is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid API key",
            )

        if not api_key.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="API key has been revoked",
            )

        # Update last_used_at
        api_key.last_used_at = datetime.now(timezone.utc)
        await db.commit()

        return api_key
