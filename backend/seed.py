#!/usr/bin/env python3
"""
seed.py — Load demo data into the Job Tracker database.

Run once after deploying to Railway so recruiters can explore the app
without having to create entries manually.

Usage:
    python backend/seed.py
"""

from app.database import Base, SessionLocal, engine
from app.models.application import Application, ApplicationStatus
from datetime import date

Base.metadata.create_all(bind=engine)

DEMO_APPLICATIONS = [
    {
        "company": "Shopify",
        "role": "Full Stack Developer",
        "location": "Ottawa, ON (Remote)",
        "status": ApplicationStatus.interview,
        "date_applied": date(2026, 4, 10),
        "url": "https://www.shopify.com/careers",
        "salary_min": 110000,
        "salary_max": 140000,
        "notes": "Tech screen passed. System design round scheduled.",
    },
    {
        "company": "Wealthsimple",
        "role": "QA Automation Engineer",
        "location": "Toronto, ON (Hybrid)",
        "status": ApplicationStatus.screening,
        "date_applied": date(2026, 4, 18),
        "url": "https://www.wealthsimple.com/en-ca/careers",
        "salary_min": 95000,
        "salary_max": 120000,
        "notes": "Recruiter call done. Waiting for technical assessment.",
    },
    {
        "company": "Hootsuite",
        "role": "SDET",
        "location": "Vancouver, BC (Remote)",
        "status": ApplicationStatus.applied,
        "date_applied": date(2026, 4, 25),
        "url": "https://hootsuite.com/careers",
        "salary_min": 100000,
        "salary_max": 125000,
        "notes": None,
    },
    {
        "company": "Lightspeed Commerce",
        "role": "Software Developer — React / TypeScript",
        "location": "Montreal, QC (Hybrid)",
        "status": ApplicationStatus.offer,
        "date_applied": date(2026, 3, 28),
        "url": "https://www.lightspeedhq.com/careers/",
        "salary_min": 120000,
        "salary_max": 150000,
        "notes": "Offer received. Reviewing compensation package.",
    },
    {
        "company": "Clio",
        "role": "Automation Developer",
        "location": "Vancouver, BC (Remote)",
        "status": ApplicationStatus.rejected,
        "date_applied": date(2026, 4, 2),
        "url": "https://www.clio.com/about/careers/",
        "salary_min": 90000,
        "salary_max": 115000,
        "notes": "Rejected after first technical round. Role filled internally.",
    },
    {
        "company": "Wave Financial",
        "role": "QA Engineer — Automation",
        "location": "Toronto, ON (Remote)",
        "status": ApplicationStatus.applied,
        "date_applied": date(2026, 5, 1),
        "url": "https://www.waveapps.com/about/careers",
        "salary_min": 85000,
        "salary_max": 105000,
        "notes": None,
    },
    {
        "company": "1Password",
        "role": "Full Stack Engineer",
        "location": "Remote — Canada",
        "status": ApplicationStatus.screening,
        "date_applied": date(2026, 5, 5),
        "url": "https://1password.com/careers",
        "salary_min": 115000,
        "salary_max": 145000,
        "notes": "Async video interview sent.",
    },
    {
        "company": "Cohere",
        "role": "Software Engineer — Backend",
        "location": "Toronto, ON",
        "status": ApplicationStatus.applied,
        "date_applied": date(2026, 5, 8),
        "url": "https://cohere.com/careers",
        "salary_min": 130000,
        "salary_max": 160000,
        "notes": None,
    },
]


def seed():
    db = SessionLocal()
    try:
        existing = db.query(Application).count()
        if existing > 0:
            print(f"Database already has {existing} applications. Skipping seed.")
            return

        for data in DEMO_APPLICATIONS:
            db.add(Application(**data))
        db.commit()
        print(f"✅ Seeded {len(DEMO_APPLICATIONS)} demo applications.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
