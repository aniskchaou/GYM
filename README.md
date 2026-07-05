# GymFlow SaaS

> Professional gym & fitness management SaaS — built with Next.js, NestJS, PostgreSQL, Prisma, and Stripe.
> Supports gyms, standalone personal trainers, yoga/Pilates studios, online coaches, and wellness professionals.

---

## Monorepo Structure

```
gymflow-saas/
├── apps/
│   ├── web/                  # Next.js 14 (App Router) — frontend dashboards
│   └── api/                  # NestJS — REST API backend
├── packages/
│   └── database/             # Prisma schema + migrations + seed
├── demo/                     # Static demo SPA (port 3001) — all roles, no server required
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
- [x] **Training content publishing** — trainers publish videos, audio, PDFs, and live streams; members browse and track progress
- [x] **File uploads** — video (500 MB), audio (100 MB), PDF (20 MB), image thumbnails served as static files
- [x] **Super Admin portal** — SaaS-level tenant management, gym billing, and platform analytics
- [x] **Demo app** — full interactive demo at port 3001, all 6 roles, no backend required

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
| File Storage | Local disk (`uploads/`) → AWS S3 (production) |
| File Uploads | Multer (video 500 MB · audio 100 MB · PDF 20 MB) |
| Realtime | Socket.IO |
| Monorepo | Turborepo |

---

## Training Content System

Trainers can publish multimedia content for members to consume:

| Content Type | Formats | Max Size |
|---|---|---|
| Video | MP4, MOV, WebM | 500 MB |
| Audio | MP3, WAV, M4A, OGG | 100 MB |
| PDF / Guide | PDF | 20 MB |
| Live Stream | Stream URL + scheduled datetime | — |

**Visibility levels**: `PUBLIC` · `MEMBERS_ONLY` · `SUBSCRIBERS_ONLY`

Members get an inline video/audio player, per-video watch-progress tracking, and a live streams banner showing upcoming sessions.

Supported fitness categories: Strength · HIIT · Yoga · Pilates · Cardio · CrossFit · Boxing · Nutrition · Mobility · Meditation · Running · Cycling · Swimming · Dance · Rehabilitation · Mental Wellness

---

## Demo App

A fully interactive static demo runs on **port 3001** with no database required.

```bash
cd demo
npm install
node server.js
```

Open http://localhost:3001 and log in as any of the 6 roles:

| Role | Email | Password |
|---|---|---|
| Super Admin | superadmin@gymflow.com | demo123 |
| Gym Owner | owner@fitpro.com | demo123 |
| Receptionist | reception@fitpro.com | demo123 |
| Trainer | trainer@fitpro.com | demo123 |
| Member | member@fitpro.com | demo123 |

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

## One-Click Launcher

A local GUI launcher is available for setup and daily development flow.

1. Start launcher:

```bash
npm run launcher
```

2. Open:

- http://127.0.0.1:3030

From the launcher you can:

- Follow a 4-step wizard flow (check environment, configure database, install/bootstrap, run/stop)
- Save database connection values to `apps/api/.env` and `packages/database/.env`
- Install dependencies and run `db:generate`, `db:migrate`, `db:seed`
- Start/stop Turbo dev, API-only, or Web-only services
- Monitor live logs in one place

Database engine note:

- The launcher UI shows SQLite/PostgreSQL/MySQL cards for guided setup parity with premium docs style.
- Current GymFlow Prisma schema is PostgreSQL-only, so PostgreSQL is the supported runtime engine.

Windows quick launch:

- Double-click `launcher.bat`

---

## Development Phases

| Phase | Timeline | Scope |
|---|---|---|
| Phase 1 — MVP | 2–4 months | Auth, Members, Plans, Attendance, Booking, Payments |
| Phase 2 — Pro | 3–6 months | Mobile apps, Trainer tools, CRM, POS, Training Content |
| Phase 3 — Enterprise | 6–12 months | AI features, Hardware integrations, Multi-branch, Live streaming infra |
