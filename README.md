<h1 align="center">Support CRM</h1>

<p align="center">
  <strong>The ticketing system for small support teams.</strong><br>
  Customers raise tickets in seconds, the team triages by status and priority, and every update lands on a timeline — no spreadsheets, no lost threads.
</p>

<p align="center">
  <a href="https://support-crm-app.vercel.app"><img src="https://img.shields.io/badge/Live%20demo-support--crm--app.vercel.app-16a34a?style=flat-square&logo=vercel&logoColor=white" alt="Live demo"></a>
  &nbsp;
  <a href="https://support-crm-api-czws.onrender.com/docs"><img src="https://img.shields.io/badge/API%20docs-Swagger%20UI-85EA2D?style=flat-square&logo=swagger&logoColor=black" alt="API documentation"></a>
  &nbsp;
  <img src="https://img.shields.io/badge/license-MIT-38bdf8?style=flat-square" alt="MIT license">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js%2014-000000?style=flat-square&logo=next.js&logoColor=white" alt="Next.js 14">
  &nbsp;
  <img src="https://img.shields.io/badge/NestJS%2010-E0234E?style=flat-square&logo=nestjs&logoColor=white" alt="NestJS 10">
  &nbsp;
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript">
  &nbsp;
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL">
  &nbsp;
  <img src="https://img.shields.io/badge/Prisma%205-2D3748?style=flat-square&logo=prisma&logoColor=white" alt="Prisma 5">
  &nbsp;
  <img src="https://img.shields.io/badge/Tailwind%20CSS%203-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS 3">
</p>

<p align="center">
  <a href="https://support-crm-app.vercel.app">Live demo</a> ·
  <a href="#screenshots">Screenshots</a> ·
  <a href="#features">Features</a> ·
  <a href="#engineering-highlights">Engineering</a> ·
  <a href="#architecture">Architecture</a> ·
  <a href="#getting-started">Getting started</a> ·
  <a href="#api-overview">API</a>
</p>

---

## What is Support CRM?

Support CRM is a focused ticketing system for small support teams. Customers raise a ticket with their contact details and issue; the team works everything from a single queue, moves tickets through Open → In Progress → Closed, and records every update as a note on the ticket's timeline. Priorities carry a response clock, so the urgent work announces itself instead of hiding.

The whole product lives in this repo and runs live on the internet: a Next.js 14 App Router web app, a NestJS 10 API, and PostgreSQL with Prisma — deployed on Vercel, Render, and Neon.

**How a ticket moves**

1. **Raise** — the customer submits name, email, subject, description, and an optional priority. The API validates everything and issues a readable `TKT-xxx` ID.
2. **Triage** — the ticket lands in the queue with search, status filters, and SLA-aware sorting; overdue tickets are flagged the moment they slip.
3. **Work it** — open the ticket for full contact details and description, move it to In Progress, adjust priority, and add notes as the investigation unfolds.
4. **Close** — marking it Closed stops the SLA clock and preserves the full note history.

## Screenshots

**Ticket queue** — search, status filters, priorities, and overdue flags

![Ticket queue](docs/screenshots/queue.png)

**Ticket detail** — status and priority updates with a notes timeline

![Ticket detail](docs/screenshots/detail.png)

**New ticket** — validated intake form

![New ticket form](docs/screenshots/new.png)

## Features

**For customers**

- **Raise a ticket in under a minute** — name, email, subject, description, and optional priority, validated in the browser and again on the server.
- **A reference you can read aloud** — every ticket gets a stable `TKT-xxx` ID and a timestamp at creation.

**For support teams**

- **One queue, newest first** — ID, customer, subject, status, priority, and created date at a glance. Table on desktop, tappable cards on mobile.
- **Search that keeps up** — debounced as-you-type search across ticket ID, name, email, subject, and description, no page reloads.
- **Triage in one row of chips** — filter All / Open / In Progress / Closed, or flip on "Urgent first" to sort by priority weight with overdue tickets leading.
- **Priorities with a clock** — URGENT 4h, HIGH 24h, MEDIUM 72h, LOW 120h. Overdue badges mark the queue, and Closed tickets drop out of the clock.
- **The whole story on one page** — contact info, description, status and priority controls, and a chronological notes timeline with `en-IN` timestamps.
- **Updates that send only what changed** — status and priority edits are diffed client-side; note-only updates still bump `updated_at` so the queue stays honest.

**For operators**

- **Self-documenting API** — Swagger UI at `/docs`, generated from the NestJS controllers and DTOs.
- **Health checks** — `GET /health` sits outside the `/api` prefix, ready for an uptime monitor.
- **Rate limiting** — request throttling on the API out of the box.
- **Deterministic demo data** — 15 seeded tickets across every status and priority, reseedable with one command.

## Engineering highlights

- **Race-free ticket IDs** — the API inserts the row first, derives `TKT-xxx` from the autoincrement id, and writes it back inside a single Prisma `$transaction`. No `count + 1` race when tickets arrive at once.
- **SLA without a scheduler** — due dates and overdue flags are computed at read time from `created_at` and priority. There is no cron to drift or fail, and closed tickets stop the clock.
- **Validation in two places** — `zod` + react-hook-form in the browser, `class-validator` DTOs with `whitelist` and `transform` on the API.
- **Thin controllers, real service rules** — invalid status and priority values are rejected server-side, not just hidden in the UI.
- **One failure shape** — a global exception filter normalizes API errors so the frontend always knows what it's parsing.
- **Change-only writes** — updates carry only the fields that changed, and creating a note plus touching the ticket commit in one transaction.
- **Typed end to end** — a single TypeScript workspace across the API and web app, with a typed fetch client in [`apps/web/src/lib/api.ts`](apps/web/src/lib/api.ts).

## Architecture

A typed npm-workspace monorepo. PostgreSQL is the source of truth, accessed only through the NestJS API; the Next.js app is a client that talks to the API over HTTP and never touches the database.

```text
┌─────────────────────────────────────────────────┐
│              Next.js 14 · App Router            │
│      (Vercel · React 18 · Tailwind CSS 3)       │
│                                                 │
│     Queue · Ticket detail · New ticket form     │
└────────────────────────┬────────────────────────┘
                         │  HTTP (JSON)
┌────────────────────────▼────────────────────────┐
│               NestJS 10 API Server              │
│                                                 │
│       Tickets · Health · Prisma · Common        │
│     validation · throttling · Swagger /docs     │
└────────────────────────┬────────────────────────┘
                         │  Prisma
                  ┌──────▼───────┐
                  │  PostgreSQL  │
                  │    (Neon)    │
                  └──────────────┘
```

**Key decisions**

- Modular monolith — ticket rules live in the service layer; controllers stay thin.
- Monorepo with `apps/api` and `apps/web` and one `npm install` at the root.
- PostgreSQL is the source of truth, reached only through the API; CORS is explicit so the web app is the only browser client.
- Read-time SLA instead of background jobs — simple at this scale, and impossible to leave stale.
- Notes are first-class rows, not a JSON blob, so the timeline is ordered and queryable in the database.

## Tech stack

| Layer       | Technology                                           |
| ----------- | ---------------------------------------------------- |
| Web app     | Next.js 14 (App Router) · React 18 · Tailwind CSS 3  |
| Data & forms| TanStack Query · react-hook-form · zod · sonner     |
| API         | NestJS 10 · TypeScript                               |
| Validation  | class-validator · class-transformer                  |
| Database    | PostgreSQL · Prisma 5                                |
| API docs    | Swagger UI (`/docs`)                                 |
| Deployment  | Vercel (web) · Render (API) · Neon (PostgreSQL)      |

## Repository layout

```text
support-crm/
├── apps/
│   ├── api/                        # NestJS API
│   │   ├── prisma/
│   │   │   ├── schema.prisma       # Ticket + Note models, status/priority enums
│   │   │   ├── migrations/         # versioned SQL migrations
│   │   │   └── seed.ts             # 15 deterministic demo tickets
│   │   └── src/
│   │       ├── tickets/            # controller, service, DTOs, SLA rules
│   │       ├── health/             # GET /health for uptime checks
│   │       ├── prisma/             # database module
│   │       └── common/             # global exception filter
│   └── web/                        # Next.js App Router web app
│       └── src/
│           ├── app/                # queue, ticket detail, new-ticket routes
│           ├── components/         # status and priority badges, providers
│           ├── hooks/              # debounced search
│           └── lib/                # typed API client, formatting helpers
├── docs/screenshots/               # README screenshots
├── render.yaml                     # Render blueprint for the API
└── package.json                    # npm workspaces and root scripts
```

## Live demo

Both halves of the stack are deployed and open to explore:

- **Web app** → [support-crm-app.vercel.app](https://support-crm-app.vercel.app)
- **API docs** → [support-crm-api-czws.onrender.com/docs](https://support-crm-api-czws.onrender.com/docs) (Swagger UI)
- **Health** → [support-crm-api-czws.onrender.com/health](https://support-crm-api-czws.onrender.com/health)

The demo is seeded with 15 tickets across every status and priority — including overdue urgent tickets, so the queue has something to say. There is no sign-in; it's a single-team workspace.

> **Note:** the API runs on Render's free tier — the first request after idle can take ~50s to wake up.

## Getting started

**Prerequisites:** Node.js 20+ and PostgreSQL (local or Neon).

```bash
git clone https://github.com/adityasah15/support-crm.git
cd support-crm
npm install
```

**1. Configure the environment**

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

`apps/api/.env`:

```env
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require&pgbouncer=true"
DIRECT_URL="postgresql://user:pass@host/db?sslmode=require"
CORS_ORIGIN="http://localhost:3000"
PORT=4000
```

`apps/web/.env.local`:

```env
NEXT_PUBLIC_API_URL="http://localhost:4000/api"
```

**2. Migrate and seed** (the seed resets tickets and notes — safe locally, intentional)

```bash
npx prisma migrate deploy --schema apps/api/prisma/schema.prisma
npm run prisma:seed --workspace apps/api
```

**3. Run both apps**

```bash
npm run dev:api   # API     → http://localhost:4000
npm run dev:web   # Web app → http://localhost:3000
```

Once running:

- Web app → `http://localhost:3000`
- Tickets API → `http://localhost:4000/api/tickets`
- Swagger UI → `http://localhost:4000/docs`
- Health → `http://localhost:4000/health`

## API overview

| Method | Endpoint                 | Description                              |
| ------ | ------------------------ | ---------------------------------------- |
| POST   | `/api/tickets`           | Create a ticket, returns its ID          |
| GET    | `/api/tickets`           | List tickets, optional status + search   |
| GET    | `/api/tickets/:ticketId` | Full ticket with notes, 404 if missing   |
| PUT    | `/api/tickets/:ticketId` | Update status/priority, add a note       |

Status accepts `Open` / `In Progress` / `Closed`; priority accepts `LOW` / `MEDIUM` / `HIGH` / `URGENT`. List and detail responses include `priority`, `sla_due_at`, and `overdue`, so clients always render the SLA clock from server values.

## Testing

```bash
npm test          # API unit tests (Jest)
npm run build     # production builds for both workspaces
```

## Deployment

1. **Neon** — create a project and copy the pooled and direct connection strings.
2. **Migrate and seed** — run `prisma migrate deploy`; seed only if the database is empty, because the seed resets tickets and notes.
3. **API on Render** — deploy with `render.yaml`; set `DATABASE_URL`, `DIRECT_URL`, and `CORS_ORIGIN`. The build includes `prisma generate`.
4. **Web on Vercel** — set the root to `apps/web` and `NEXT_PUBLIC_API_URL` to the Render API's `/api` URL.
5. **Smoke test** — set `CORS_ORIGIN` to the web URL, redeploy, then create → search → filter → update → note → hard refresh.

## License

[MIT](LICENSE) © 2026 Aditya Sah

*Originally built as a hiring assessment submission.*
