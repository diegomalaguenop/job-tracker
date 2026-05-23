# backend/app/schemas/application.py
from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, HttpUrl, model_validator

from app.models.application import ApplicationStatus


class ApplicationBase(BaseModel):
    company: str
    role: str
    location: str
    status: ApplicationStatus = ApplicationStatus.applied
    date_applied: date
    url: Optional[str] = None
    notes: Optional[str] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None

    @model_validator(mode="after")
    def salary_range_valid(self):
        if self.salary_min and self.salary_max:
            if self.salary_min > self.salary_max:
                raise ValueError("salary_min must be less than or equal to salary_max")
        return self


class ApplicationCreate(ApplicationBase):
    pass


class ApplicationUpdate(BaseModel):
    """All fields optional for partial updates."""
    company: Optional[str] = None
    role: Optional[str] = None
    location: Optional[str] = None
    status: Optional[ApplicationStatus] = None
    date_applied: Optional[date] = None
    url: Optional[str] = None
    notes: Optional[str] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None


class ApplicationRead(ApplicationBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ApplicationStats(BaseModel):
    total: int
    by_status: dict[str, int]
    response_rate: float  # (total - applied) / total, as a percentage
    active_pipeline: int  # screening + interview
    offers: int
