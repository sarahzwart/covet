# Progress & Roadmap

_Last updated: 2026-10-22_

This file tracks where the project is and what comes next. Project rules live in [`CLAUDE.md`](../CLAUDE.md).

## Where we are

**Done**
- [x] **Step 0: Repository setup.** The project has its own git repo, a root `.gitignore`, `.env.example` files for the backend and frontend, and a README.
- [x] **Step 1: Backend skeleton.**
  - FastAPI app with `GET /api/health`
  - Centralized settings (`backend/app/config.py`)
  - CORS for the frontend
  - pytest with 2 passing tests
- [x] **Frontend, built first on demo data.** All core screens work against an in-memory demo backend:
  - `/`: tracked items list with grouping (All / By store / By type, kept in `?group=`), an SMS-alerts toggle, delete with confirmation, and badges for stock, target met, stale data and demo data. Includes an empty state.
  - `/track`: paste a URL, preview the product (with loading and error states), pick a size (out-of-stock sizes allowed), set a target (any drop, a price, or percent off), choose a category, then start tracking.
  - `/items/[id]`: product detail with the price history table, alerts toggle and delete.
  - Error, loading and not-found pages. shadcn/ui uses the `base-nova` preset, which is built on Base UI.

**How the frontend talks to data:** Server Components and Server Actions (`app/actions.ts`) call `lib/api.ts`, and `lib/api.ts` currently delegates to `lib/demo-backend.ts`. Wiring up the backend means replacing each `lib/api.ts` function body with a `fetch(`${API_URL}/api/...`)` call. The types in `frontend/types/index.ts` define the API contract the FastAPI schemas should match.

**Next up: Step 2, database (Supabase).** Decided: use Supabase **as plain PostgreSQL only**. The backend connects with SQLAlchemy, Alembic owns the schema, and we don't use the Supabase JS client, Auth or Data API. There is no local Docker database.

To do before step 2 starts:
1. Create a Supabase project and save the database password.
2. Turn off **Project Settings → Data API**, since we don't use it and it would expose `public` tables.
3. Copy `backend/.env.example` to `backend/.env` and set `DATABASE_URL` from the **Session pooler** connection string (port 5432):
   ```
   postgresql+psycopg://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres?sslmode=require
   ```
   - URL-encode any special characters in the password.
   - Don't use the "Direct connection" string, which is IPv6-only on the free tier.
   - Don't use the "Transaction pooler" on port 6543, which breaks Alembic and prepared statements.
4. Optionally create a second free Supabase project for integration tests, so tests never touch real data.

Step 2 will then:
- Add SQLAlchemy and psycopg.
- Set up Alembic with migrations in `database/migrations`.
- Create the first tables, with row-level security (RLS) enabled.
- Add a database check to the health endpoint.
- Update `.env.example` and the README for Supabase.

## Roadmap

Each step is small, runnable and tested before moving on.

| # | Step | Status |
|---|------|--------|
| 0 | Repository setup | ✅ |
| 1 | Backend skeleton: FastAPI, settings, health check, pytest | ✅ |
| 2 | Database: Supabase, SQLAlchemy models, Alembic migration, health check that verifies the database | ⏭ next |
| 3 | Retailer interface, plus a demo adapter whose data is clearly labeled `is_demo`, plus domain validation | |
| 4 | ⭐ **First useful feature: "Preview a product."** `POST /api/products/preview`, then switch `lib/api.ts` `previewProduct` to call it | Frontend ✅ (demo data) |
| 5 | Track it: tracked-items API (create, list, get, toggle notifications, delete), then switch the remaining `lib/api.ts` functions to it | Frontend ✅ (demo data) |
| 6 | Real Abercrombie adapter (needs the data-source decision below) | |
| 7 | Scheduler job and price history recording (UI for history and staleness already exists) | |
| 8 | Notification eligibility rules, console notifier, then Twilio (confirm cost first) | |
| 9 | Later: more retailers, accounts and phone verification, AI features only if justified | |

## Architecture summary

```
Browser ──> Next.js (RSC + Server Actions ─> lib/api.ts) ──fetch JSON──> FastAPI (/api/...)
                                                        │
                    api/ (thin routes) ─> services/ (tracking logic)
                                                        │           │
                                         retailers/ (adapters)   models/ via SQLAlchemy ─> PostgreSQL (Supabase)
                                                        ▲
              jobs/ (scheduler process) ─ uses the same services ─> notifications (Twilio)
```

- **Frontend:** UI only, with no secrets. All backend calls go through `lib/api.ts`, which runs only on the server (Server Components and Server Actions). The backend URL is the server-only `API_URL`.
- **`api/`:** validates requests with Pydantic, calls a service and returns a schema. It contains no business logic.
- **`services/`:** deterministic tracking rules, unit-tested.
- **`retailers/`:** a `RetailerAdapter` protocol with `supports(url)` and `fetch_product(url) -> ProductSnapshot`. Size availability is `in_stock | out_of_stock | unknown`. Only allowed domains are accepted, to prevent SSRF.
- **`jobs/`:** a separate scheduler process that records price observations and checks notification eligibility.
- **Planned tables:**
  - `products`
  - `tracked_items`
  - `price_observations` (includes `is_demo` and `fetched_at`)
  - `notifications` (a UNIQUE `event_key` prevents duplicate SMS)
- **Notification rule:** notify only when **all** of these are true:
  - notifications are enabled for the item
  - the data is fresh
  - the data is not demo data
  - the size is `in_stock`, never `unknown`
  - the price is at or below the target (or below the baseline if no target is set)
  - no notification has been sent for this event yet

## Open questions and risks

- **Phone number for SMS:** the UI doesn't collect one yet. That needs a settings page or accounts, plus phone verification, before Twilio goes live.
- **Frontend tests:** there are no frontend unit tests yet; changes are checked with `tsc`, ESLint and `next build`. If the frontend logic grows, consider adding Vitest for `lib/tracking.ts` and `lib/retailers.ts`.

- **Abercrombie data source (the main risk).** There is no known public API. The options to evaluate before step 6:
  - Structured data on product pages: price is likely available, but size-level stock often isn't. Requires reviewing the Terms of Use and robots.txt.
  - The site's internal JSON endpoints: undocumented, bot-protected and probably prohibited by the terms of service. Avoid.
  - Affiliate product feeds: legitimate, but need approval, update about daily and often lack per-size stock.
  - Paid product-data APIs: need cost approval and checks on coverage and freshness.
- **Size identity:** store the retailer's variant or SKU ID, not just the label, because sizes vary by color and fit.
- **Price semantics:** list price versus sale price, cart-only promotions, currency and region.
- **Twilio:** trial accounts can only text verified numbers, and US A2P 10DLC registration is needed for production.

## Environment notes

- Python 3.12, with a virtual environment in `backend/.venv` that isn't committed.
- Frontend: Next.js 16.4 / React 19.3. This version has breaking changes, so read `frontend/node_modules/next/dist/docs/` before writing frontend code (see `frontend/AGENTS.md`).
- On a new machine:
  - Backend: follow the steps in [`README.md`](../README.md).
  - Frontend: run `npm install` in `frontend/`.
