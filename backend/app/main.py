# backend/app/main.py
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers import applications

# Create all tables on startup (SQLite, no migrations needed for dev)
Base.metadata.create_all(bind=engine)

# Auto-seed demo data on startup (safe: skips if data already exists)
# Needed on platforms with ephemeral filesystems (Render free tier)
try:
    import sys, os
    sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
    from seed import seed
    seed()
except Exception:
    pass  # never block startup due to seed errors

app = FastAPI(
    title="Job Tracker API",
    description="Backend for the Job Application Tracker portfolio project.",
    version="1.0.0",
)

# CORS_ORIGINS env var allows multiple origins separated by comma.
# Defaults to localhost dev server if not set.
_raw_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173")
cors_origins = [o.strip() for o in _raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(applications.router)


@app.get("/health")
def health():
    return {"status": "ok"}
