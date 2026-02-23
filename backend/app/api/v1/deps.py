import uuid

from fastapi import Header


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
