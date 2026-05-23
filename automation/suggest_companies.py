#!/usr/bin/env python3
"""
suggest_companies.py — Canadian Tech Job Suggester

Fetches remote-friendly tech jobs from public APIs (no auth required),
scores them against a developer profile, and writes:
  - automation/suggestions.json  (machine-readable, full data)
  - automation/suggestions.md    (human-readable, for review)

Sources:
  - RemoteOK API         https://remoteok.com/api
  - We Work Remotely RSS https://weworkremotely.com/remote-jobs.rss
  - Arbeitnow API        https://www.arbeitnow.com/api/job-board-api

Usage:
  python automation/suggest_companies.py
"""

import json
import time
import xml.etree.ElementTree as ET
from datetime import datetime
from pathlib import Path
from urllib.request import Request, urlopen

# ── Profile ───────────────────────────────────────────────────────────────────
# Edit this to match your current stack and preferences.

PROFILE = {
    "name": "Diego Malagueño",
    "target_locations": ["canada", "remote", "toronto", "vancouver", "montreal", "ottawa"],
    "stack_keywords": [
        "react", "typescript", "javascript", "python", "fastapi",
        "playwright", "selenium", "sql", "azure", "c#", ".net",
        "qa automation", "test automation", "sdet", "e2e",
    ],
    "role_keywords": [
        "full stack", "fullstack", "frontend", "react developer",
        "qa", "quality assurance", "automation", "sdet",
        "software developer", "software engineer",
    ],
    "exclude_keywords": [
        "10+ years", "staff engineer", "principal engineer",
        "vp of", "director of", "head of", "lead architect",
    ],
}

TOP_N = 30  # how many results to include in output

# ── HTTP helper ───────────────────────────────────────────────────────────────

HEADERS = {"User-Agent": "job-tracker-portfolio/1.0 (github.com/diegomalaguenop/job-tracker)"}


def get_json(url: str) -> object:
    req = Request(url, headers=HEADERS)
    with urlopen(req, timeout=15) as resp:
        return json.loads(resp.read().decode("utf-8"))


def get_rss(url: str) -> ET.Element:
    req = Request(url, headers=HEADERS)
    with urlopen(req, timeout=15) as resp:
        return ET.parse(resp).getroot()


# ── Scoring ───────────────────────────────────────────────────────────────────

def score_job(title: str, description: str, location: str) -> int:
    """
    Score a job posting against the profile.
    Higher = better match. Negative score from exclusions.
    """
    text = f"{title} {description} {location}".lower()
    score = 0

    for kw in PROFILE["stack_keywords"]:
        if kw in text:
            score += 2

    for kw in PROFILE["role_keywords"]:
        if kw in text:
            score += 3

    for loc in PROFILE["target_locations"]:
        if loc in text:
            score += 2

    for ex in PROFILE["exclude_keywords"]:
        if ex in text:
            score -= 6

    return score


# ── Sources ───────────────────────────────────────────────────────────────────

def fetch_remoteok() -> list[dict]:
    """RemoteOK public API — returns JSON array, first element is metadata."""
    results = []
    try:
        data = get_json("https://remoteok.com/api?tag=react,python,typescript,qa")
        for job in data:
            if not isinstance(job, dict) or "position" not in job:
                continue
            title = job.get("position", "")
            company = job.get("company", "Unknown")
            url = job.get("url", "")
            description = job.get("description", "")
            tags = job.get("tags", [])
            s = score_job(title, f"{description} {' '.join(tags)}", "remote")
            if s > 0:
                results.append({
                    "company": company,
                    "role": title,
                    "location": "Remote",
                    "url": url,
                    "tags": tags[:8],
                    "score": s,
                    "source": "RemoteOK",
                })
    except Exception as exc:
        print(f"  [!] RemoteOK failed: {exc}")
    return results


def fetch_weworkremotely() -> list[dict]:
    """We Work Remotely RSS feed — rich source of async/remote roles."""
    results = []
    try:
        root = get_rss("https://weworkremotely.com/remote-jobs.rss")
        ns = "https://weworkremotely.com"
        for item in root.findall(".//item"):
            title = item.findtext("title", "")
            company = item.findtext(f"{{{ns}}}company", "")
            url = item.findtext("link", "")
            description = item.findtext("description", "")
            region = item.findtext(f"{{{ns}}}region", "Worldwide")
            s = score_job(title, description, region)
            if s > 0:
                results.append({
                    "company": company,
                    "role": title,
                    "location": region or "Remote",
                    "url": url,
                    "tags": [],
                    "score": s,
                    "source": "We Work Remotely",
                })
    except Exception as exc:
        print(f"  [!] We Work Remotely failed: {exc}")
    return results


def fetch_arbeitnow() -> list[dict]:
    """Arbeitnow public API — good for international + remote roles."""
    results = []
    try:
        data = get_json("https://www.arbeitnow.com/api/job-board-api")
        for job in data.get("data", []):
            title = job.get("title", "")
            company = job.get("company_name", "Unknown")
            url = job.get("url", "")
            description = job.get("description", "")
            location = job.get("location", "Remote")
            tags = job.get("tags", [])
            s = score_job(title, f"{description} {' '.join(tags)}", location)
            if s > 2:  # slightly higher threshold — noisier source
                results.append({
                    "company": company,
                    "role": title,
                    "location": location,
                    "url": url,
                    "tags": tags[:8],
                    "score": s,
                    "source": "Arbeitnow",
                })
    except Exception as exc:
        print(f"  [!] Arbeitnow failed: {exc}")
    return results


# ── Deduplication ─────────────────────────────────────────────────────────────

def deduplicate(jobs: list[dict]) -> list[dict]:
    seen: set[tuple] = set()
    unique = []
    for job in jobs:
        key = (job["company"].strip().lower(), job["role"].strip().lower())
        if key not in seen:
            seen.add(key)
            unique.append(job)
    return unique


# ── Output writers ────────────────────────────────────────────────────────────

def write_json(jobs: list[dict], path: Path) -> None:
    payload = {
        "generated_at": datetime.now().isoformat(),
        "profile": PROFILE["name"],
        "total": len(jobs),
        "jobs": jobs,
    }
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")


def write_markdown(jobs: list[dict], path: Path) -> None:
    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    lines = [
        f"# Job Suggestions — {now}",
        "",
        f"**Profile:** {PROFILE['name']}  ",
        f"**Stack match:** {', '.join(PROFILE['stack_keywords'][:8])}  ",
        f"**Total matches:** {len(jobs)}",
        "",
        "---",
        "",
    ]
    for i, job in enumerate(jobs, 1):
        tags = " · ".join(f"`{t}`" for t in job["tags"][:6]) if job["tags"] else "—"
        lines += [
            f"## {i}. {job['company']}",
            f"**Role:** {job['role']}  ",
            f"**Location:** {job['location']}  ",
            f"**Source:** {job['source']}  ",
            f"**Match score:** {job['score']}  ",
            f"**Tags:** {tags}  ",
            f"**Apply:** {job['url']}  ",
            "",
        ]
    path.write_text("\n".join(lines), encoding="utf-8")


# ── Main ──────────────────────────────────────────────────────────────────────

def main() -> None:
    print("🔍 Job Suggester — fetching from public APIs\n")

    all_jobs: list[dict] = []

    print("  → RemoteOK...")
    all_jobs += fetch_remoteok()
    time.sleep(1)  # rate limiting courtesy

    print("  → We Work Remotely...")
    all_jobs += fetch_weworkremotely()
    time.sleep(1)

    print("  → Arbeitnow...")
    all_jobs += fetch_arbeitnow()

    # Sort by score desc, deduplicate, take top N
    all_jobs.sort(key=lambda j: j["score"], reverse=True)
    top_jobs = deduplicate(all_jobs)[:TOP_N]

    out_dir = Path(__file__).parent
    write_json(top_jobs, out_dir / "suggestions.json")
    write_markdown(top_jobs, out_dir / "suggestions.md")

    print(f"\n✅ {len(top_jobs)} suggestions written to:")
    print(f"   automation/suggestions.json")
    print(f"   automation/suggestions.md")

    if top_jobs:
        print("\nTop 5 matches:")
        for job in top_jobs[:5]:
            print(f"  [{job['score']:>3}] {job['company']:<30} {job['role'][:40]}")
            print(f"        {job['source']} · {job['location']}")


if __name__ == "__main__":
    main()
