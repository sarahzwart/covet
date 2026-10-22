# Covet

Covet is a fashion price tracker. You paste a clothing product URL, pick your size and set an optional target price. When the price reaches your target while your size is in stock, Covet sends you an SMS.

> **Status:** early setup. Features land incrementally. See [`docs/PROGRESS.md`](docs/PROGRESS.md) for current status and roadmap, and `CLAUDE.md` for project rules.

## Stack

| Layer    | Tech                                                   |
|----------|--------------------------------------------------------|
| Frontend | Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| Backend  | Python, FastAPI, Pydantic, SQLAlchemy, Alembic         |
| Data     | PostgreSQL                                             |
| SMS      | Twilio                                                 |

## Repository layout

```text
frontend/   Next.js app (UI only; talks to the backend over JSON)
backend/    FastAPI app: API routes, services, retailer adapters, jobs
database/   Alembic migrations
```

## Prerequisites

- Node.js 20+
- Python 3.12+
- A PostgreSQL database (we use a free Supabase project; see `docs/PROGRESS.md`)

## Environment variables

Copy each example file and fill in values. Real `.env` files are git-ignored.

- `backend/.env.example` → `backend/.env`
- `frontend/.env.example` → `frontend/.env.local`

## Running locally

### Backend

From `backend/` (PowerShell):

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env

uvicorn app.main:app --reload --port 8000
```

- Health check: <http://localhost:8000/api/health>
- Interactive API docs: <http://localhost:8000/docs>

Run tests with `pytest`.

_Database and frontend steps will be added as those pieces are wired up._
