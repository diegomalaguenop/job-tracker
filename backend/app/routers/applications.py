# backend/app/routers/applications.py
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.application import Application, ApplicationStatus
from app.schemas.application import (
    ApplicationCreate,
    ApplicationRead,
    ApplicationStats,
    ApplicationUpdate,
)

router = APIRouter(prefix="/applications", tags=["applications"])


@router.get("/stats", response_model=ApplicationStats)
def get_stats(db: Session = Depends(get_db)):
    """Aggregate metrics for the dashboard."""
    total = db.scalar(select(func.count()).select_from(Application)) or 0

    # Count per status
    rows = db.execute(
        select(Application.status, func.count().label("n"))
        .group_by(Application.status)
    ).all()
    by_status: dict[str, int] = {status.value: 0 for status in ApplicationStatus}
    for row in rows:
        by_status[row.status.value] = row.n

    active_pipeline = by_status["screening"] + by_status["interview"]
    offers = by_status["offer"]
    responded = total - by_status["applied"]
    response_rate = round((responded / total) * 100, 1) if total > 0 else 0.0

    return ApplicationStats(
        total=total,
        by_status=by_status,
        response_rate=response_rate,
        active_pipeline=active_pipeline,
        offers=offers,
    )


@router.get("", response_model=list[ApplicationRead])
def list_applications(
    status: Optional[ApplicationStatus] = Query(None),
    location: Optional[str] = Query(None),
    search: Optional[str] = Query(None, description="Search by company or role"),
    db: Session = Depends(get_db),
):
    """List all applications with optional filters."""
    stmt = select(Application)

    if status:
        stmt = stmt.where(Application.status == status)
    if location:
        stmt = stmt.where(Application.location.ilike(f"%{location}%"))
    if search:
        stmt = stmt.where(
            Application.company.ilike(f"%{search}%")
            | Application.role.ilike(f"%{search}%")
        )

    stmt = stmt.order_by(Application.date_applied.desc())
    return db.execute(stmt).scalars().all()


@router.post("", response_model=ApplicationRead, status_code=201)
def create_application(payload: ApplicationCreate, db: Session = Depends(get_db)):
    """Create a new job application."""
    app = Application(**payload.model_dump())
    db.add(app)
    db.commit()
    db.refresh(app)
    return app


@router.get("/{app_id}", response_model=ApplicationRead)
def get_application(app_id: int, db: Session = Depends(get_db)):
    """Get a single application by ID."""
    app = db.get(Application, app_id)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    return app


@router.put("/{app_id}", response_model=ApplicationRead)
def update_application(
    app_id: int, payload: ApplicationUpdate, db: Session = Depends(get_db)
):
    """Partially update an application (only provided fields are changed)."""
    app = db.get(Application, app_id)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(app, field, value)

    db.commit()
    db.refresh(app)
    return app


@router.delete("/{app_id}", status_code=204)
def delete_application(app_id: int, db: Session = Depends(get_db)):
    """Delete an application."""
    app = db.get(Application, app_id)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    db.delete(app)
    db.commit()
