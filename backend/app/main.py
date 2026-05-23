# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers import applications

# Create all tables on startup (SQLite, no migrations needed for dev)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Job Tracker API",
    description="Backend for the Job Application Tracker portfolio project.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(applications.router)


@app.get("/health")
def health():
    return {"status": "ok"}
