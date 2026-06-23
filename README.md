# GymFlow SaaS

> Professional gym fitness management SaaS — built with Next.js, NestJS, PostgreSQL, Prisma, and Stripe.

---

## Monorepo Structure

```
gymflow-saas/
├── apps/
│   ├── web/                  # Next.js 14 (App Router) — frontend dashboards
│   └── api/                  # NestJS — REST API backend
├── packages/
│   └── database/             # Prisma schema + migrations + seed
├── .env.example
├── turbo.json
└── package.json
```

---

## User Roles

| Role | Access |
|---|---|
| **Super Admin** | Full SaaS platform control (tenant management, billing, analytics) |
| **Gym Owner** | Full gym management (members, plans, classes, trainers, reports) |
| **Branch Manager** | Manages assigned branch |
| **Receptionist** | Check-ins, walk-ins, memberships, payments |
| **Trainer** | Assigned clients, sessions, workout plans |
| **Member** | Profile, booking, fitness tracking, billing |

---

## MVP Features

- [x] Authentication (JWT + refresh tokens, role-based)
- [x] Member management (CRUD, QR card, history)
- [x] Membership plans (monthly, annual, pay-per-visit, family, student)
- [x] Stripe billing (subscriptions, invoices, webhooks)
- [x] Attendance system (check-in/out, occupancy)
- [x] Class & schedule booking (waitlists, cancellations)
- [x] Trainer management (profiles, sessions, commissions)
- [x] Receptionist dashboard
- [x] Reports & analytics
- [x] Notifications (email via SendGrid, SMS via Twilio)

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14, TailwindCSS, TanStack Query, shadcn/ui |
| Backend | NestJS, REST API |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT + Passport.js |
| Payments | Stripe |
| Email | SendGrid |
| SMS | Twilio |
| Cache | Redis |
| File Storage | AWS S3 |
| Realtime | Socket.IO |
| Monorepo | Turborepo |

---

## Quick Start

### Prerequisites

- Node.js >= 18
- PostgreSQL
- Redis

### Setup

```bash
# 1. Clone and install
npm install

# 2. Copy env files
cp .env.example apps/api/.env
cp .env.example apps/web/.env.local
cp .env.example packages/database/.env

# 3. Generate Prisma client and run migrations
npm run db:generate
npm run db:migrate

# 4. Seed the database
npm run db:seed

# 5. Start dev servers
npm run dev
```

- **Frontend**: http://localhost:3000
- **API**: http://localhost:4000
- **Prisma Studio**: `npm run db:studio`

---

## Development Phases

| Phase | Timeline | Scope |
|---|---|---|
| Phase 1 — MVP | 2–4 months | Auth, Members, Plans, Attendance, Booking, Payments |
| Phase 2 — Pro | 3–6 months | Mobile apps, Trainer tools, CRM, POS |
| Phase 3 — Enterprise | 6–12 months | AI features, Hardware integrations, Multi-branch |
