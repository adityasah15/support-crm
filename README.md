<h1 align="center">Support CRM</h1>

<p align="center">
  <strong>Full-stack customer support ticketing system built with NestJS + Next.js</strong>
</p>

<p align="center">
  Tickets · Search · Status Filter · Notes · Priority SLA
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Live-success" alt="Status">
  &nbsp;
  <img src="https://img.shields.io/badge/NestJS-E0234E?logo=nestjs&logoColor=white" alt="NestJS">
  &nbsp;
  <img src="https://img.shields.io/badge/Next.js-000000?logo=nextdotjs&logoColor=white" alt="Next.js">
  &nbsp;
  <img src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white" alt="TypeScript">
  &nbsp;
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white" alt="PostgreSQL">
  &nbsp;
  <img src="https://img.shields.io/badge/Prisma-2D3748?logo=prisma&logoColor=white" alt="Prisma">
  &nbsp;
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS">
</p>

<p align="center">
  <a href="https://support-crm-app.vercel.app">
    <img src="https://img.shields.io/badge/Live%20Demo-support--crm--app.vercel.app-blue?style=for-the-badge" alt="Live Demo">
  </a>
</p>

<p align="center">
  Web: <a href="https://support-crm-app.vercel.app">support-crm-app.vercel.app</a>
  ·
  API: <a href="https://support-crm-api-czws.onrender.com/api/tickets?limit=2">support-crm-api-czws.onrender.com</a>
</p>

---

Support CRM is a clean ticketing system for small support teams. Customers raise tickets with contact info and issue details, the team triages by status and priority, and every update is tracked as a note on a timeline. Built as a typed monorepo with a NestJS API and a Next.js App Router frontend sharing one PostgreSQL database through Prisma.

*Hiring assessment submission.*

## Screenshots

**Ticket queue** — search, status filter, priorities, and overdue flags

![Ticket queue](docs/screenshots/queue.png)

**Ticket detail** — status/priority updates and notes timeline

![Ticket detail](docs/screenshots/detail.png)

**New ticket** — validated create form

![New ticket form](docs/screenshots/new.png)

---

## Architecture

Typed monorepo. PostgreSQL is the source of truth, accessed only through the NestJS API. The Next.js app is a client that talks to the API over HTTP.

```text
┌──────────────────────┐
│   Next.js Frontend   │
└──────────┬───────────┘
           │ HTTP
┌──────────▼───────────┐
│     NestJS API       │
└──────────┬───────────┘
           │ Prisma
   ┌───────▼────────┐
   │   PostgreSQL   │
   └────────────────┘
```

**Key decisions**

- Monorepo with `apps/api` and `apps/web`
- `TKT-xxx` IDs set after insert in a transaction
- Ticket list ordered newest first for a stable queue

---

## Tech Stack

| Layer      | Technology                         |
| ---------- | ---------------------------------- |
| Runtime    | Node.js 20                         |
| Backend    | NestJS                             |
| Frontend   | Next.js + Tailwind CSS             |
| Language   | TypeScript                         |
| Database   | PostgreSQL + Prisma                |
| Deployment | Render (API) + Vercel (Web) + Neon |

---

## Core Features

### Tickets

- Create with name, email, subject, description, and optional priority
- Auto-generated `TKT-xxx` ID and timestamps
- List view with ID, name, title, status, priority, and created date
- Table on desktop, cards on mobile
- Priority SLA with overdue badge (URGENT 4h / HIGH 24h / MEDIUM 72h / LOW 120h, read-time only — no auto-escalation)

### Search & Filter

- As-you-type search across ID, name, email, subject, and description
- Filter by Open / In Progress / Closed
- Urgent-first client sort plus overdue highlighting

### Detail & Collaboration

- Full ticket view with contact info, subject, and description
- Status and priority updates (only changed fields are sent)
- Notes timeline with `en-IN` timestamps

### Platform

- Health check at `GET /health`, API docs at `/docs`

---

## Project Structure

```text
support-crm/
├── apps/
│   ├── api/
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── seed.ts
│   │   └── src/
│   │       ├── tickets/
│   │       ├── health/
│   │       ├── prisma/
│   │       └── common/
│   └── web/
│       └── src/
│           ├── app/
│           ├── components/
│           ├── hooks/
│           └── lib/
├── render.yaml
├── package.json
├── LICENSE
├── docs/screenshots/
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL (local or Neon)

### 1. Clone & install

```bash
git clone https://github.com/adityasah15/support-crm.git
cd support-crm
npm install
```

### 2. Environment

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

Fill in `apps/api/.env`:

```env
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require&pgbouncer=true"
DIRECT_URL="postgresql://user:pass@host/db?sslmode=require"
CORS_ORIGIN="http://localhost:3000"
PORT=4000
```

Fill in `apps/web/.env.local`:

```env
NEXT_PUBLIC_API_URL="http://localhost:4000/api"
```

### 3. Database

```bash
npx prisma migrate deploy --schema apps/api/prisma/schema.prisma
npm run prisma:seed --workspace apps/api
```

### 4. Run

```bash
npm run dev:api   # :4000
npm run dev:web   # :3000
```

Once running:

- Web → `http://localhost:3000`
- API → `http://localhost:4000/api/tickets`
- API docs → `http://localhost:4000/docs`
- Health → `http://localhost:4000/health`

---

## API Overview

| Method | Endpoint                 | Description                              |
| ------ | ------------------------ | ---------------------------------------- |
| POST   | `/api/tickets`           | Create a ticket, returns its ID          |
| GET    | `/api/tickets`           | List tickets, optional status + search   |
| GET    | `/api/tickets/:ticketId` | Full ticket with notes, 404 if missing   |
| PUT    | `/api/tickets/:ticketId` | Update status/priority, add a note       |

Status accepts `Open` / `In Progress` / `Closed`. List and detail responses also include `priority`, `sla_due_at`, and `overdue`.

---

## Deploy

1. Neon project → pooled + direct URLs.
2. `prisma migrate deploy` + seed (seed only if empty — it resets tickets).
3. API on Render via `render.yaml`. Env: `DATABASE_URL, DIRECT_URL, CORS_ORIGIN`. Build includes `prisma generate`.
4. Web on Vercel with root `apps/web`, env `NEXT_PUBLIC_API_URL`.
5. Set `CORS_ORIGIN` to the web URL, redeploy, smoke test create → search → filter → update → note → hard refresh.

---

## License

Licensed under the [MIT License](LICENSE).
