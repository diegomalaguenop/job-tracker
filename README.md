# Job Application Tracker

> Full-stack application to track job applications during a job search.
> Built as a portfolio project demonstrating React, FastAPI, Python automation,
> Playwright E2E testing, and GitHub Actions CI/CD.

![CI](https://github.com/diegomalaguenop/job-tracker/actions/workflows/ci.yml/badge.svg)

## Live Demo

🔗 Coming soon — seeded with demo data so you can explore without setup.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 · TypeScript · Tailwind CSS |
| Backend | FastAPI · Python 3.11 · SQLAlchemy |
| Database | SQLite (zero-setup local) |
| Automation | Python · requests |
| Testing | Playwright · TypeScript |
| CI/CD | GitHub Actions |
| Deploy | Vercel (frontend) · Railway (backend) |

## Architecture

```
job-tracker/
├── frontend/     ← React SPA (TypeScript + Tailwind)
├── backend/      ← FastAPI REST API + SQLite via SQLAlchemy
├── automation/   ← Python script: suggests Canadian tech companies to target
├── tests/        ← Playwright E2E suite (Page Object Model)
└── .github/      ← GitHub Actions CI/CD pipeline
```

## Key Features

- Full CRUD for job applications with status tracking (Applied → Screening → Interview → Offer / Rejected)
- Dashboard with real-time metrics: response rate, active pipeline, offers
- Filter by status, search by company or role
- Python automation script that suggests Canadian tech companies hiring remotely
- E2E test suite with 10+ Playwright tests running in CI on every push

## Why I built this

During my job search for Canadian tech roles, I needed a way to track applications and demonstrate my full-stack capabilities in a single public project. This app mirrors the kind of work I do at SONDA — building internal tools that combine a React frontend, a Python/FastAPI backend, automated validation scripts, and a Playwright test suite with CI/CD.

## Running locally

```bash
# 1. Clone the repo
git clone https://github.com/diegomalaguenop/job-tracker.git
cd job-tracker

# 2. Start the backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload

# 3. Start the frontend (new terminal)
cd frontend
npm install
npm run dev

# 4. Open http://localhost:5173
```

## Test suite

```bash
cd tests
npm install
npx playwright test
```

Tests cover: create/edit/delete applications, status changes, filters, search, dashboard metrics, form validation, and API error handling.

## Author

**Diego Malagueño** · Full Stack Developer / QA Automation Engineer  
[LinkedIn](https://linkedin.com/in/diegomalagueno) · [GitHub](https://github.com/diegomalaguenop)
