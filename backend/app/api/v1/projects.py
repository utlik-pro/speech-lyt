from fastapi import APIRouter
from sqlalchemy import select, func

from app.core.database import async_session
from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectListResponse, ProjectResponse

router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("", response_model=ProjectListResponse)
async def list_projects():
    """List all projects."""
    async with async_session() as db:
        query = select(Project).order_by(Project.created_at.asc())
        result = await db.execute(query)
        projects = result.scalars().all()

        count_query = select(func.count()).select_from(Project)
        total = (await db.execute(count_query)).scalar() or 0

        return ProjectListResponse(
            items=[ProjectResponse.model_validate(p) for p in projects],
            total=total,
        )


@router.post("", response_model=ProjectResponse, status_code=201)
async def create_project(payload: ProjectCreate):
    """Create a new project."""
    async with async_session() as db:
        project = Project(
            name=payload.name,
            description=payload.description,
            color=payload.color,
        )
        db.add(project)
        await db.commit()
        await db.refresh(project)
        return ProjectResponse.model_validate(project)
