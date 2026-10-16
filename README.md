# Support CRM

Datastraw assessment — Support Ticketing CRM.

Stack: NestJS · Next.js (App Router) · TypeScript · PostgreSQL · Prisma · Vercel.
See `support-crm-blueprint.md` (local-only, excluded from git) for full plan.
PDF spec is source of truth.

## Structure

```
support-crm/
├── apps/
│   ├── api/  # NestJS + Prisma (port 4000, prefix /api)
│   └── web/  # Next.js App Router (port 3000)
├── README.md
└── .gitignore
```

## Env

- Copy `apps/api/.env.example` → `apps/api/.env`
- Copy `apps/web/.env.example` → `apps/web/.env.local`

## Status

Step 1: repo scaffold only. API + web implementation follows in next commits.
