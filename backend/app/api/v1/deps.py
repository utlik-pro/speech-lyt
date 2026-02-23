import uuid

from fastapi import Depends, Header, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db

bearer_scheme = HTTPBearer(auto_error=False)


async def get_project_id(
    x_project_id: str | None = Header(default=None, alias="X-Project-Id"),
) -> uuid.UUID:
    """Extract project (organization) ID from the X-Project-Id header.

    Falls back to the default project if no header is provided.
    """
    if x_project_id:
        try:
            return uuid.UUID(x_project_id)
        except ValueError:
            pass
    # Default project
    return uuid.UUID("00000000-0000-0000-0000-000000000001")


async def get_optional_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
):
    """Return the current user if a valid Bearer token is provided, or None."""
    if not credentials:
        return None

    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
        user_id = payload.get("sub")
        if not user_id:
            return None
    except JWTError:
        return None

    from app.models.user import User

    user = await db.get(User, uuid.UUID(user_id))
    if not user or not user.is_active:
        return None
    return user


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
):
    """Return the current user. Raises 401 if not authenticated."""
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    from app.models.user import User

    user = await db.get(User, uuid.UUID(user_id))
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account deactivated")
    return user
