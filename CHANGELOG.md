# Changelog

All notable changes to GymFlow SaaS are documented here.

---

## [Unreleased]

### Added
- **Super Admin portal** — All Users management page with searchable, role-filterable table; All Gyms tenant overview; Subscriptions/MRR dashboard
- **Super Admin demo account** — `superadmin@gymflow.com` accessible from the demo login panel
- Super Admin nav items: All Users, All Gyms, Subscriptions, Audit Log, System Settings

### Changed
- **Demo — Member dashboard** — Replaced plain stats with a digital membership card (indigo/purple gradient) showing name, member number, plan, valid-until date and status badge; added SVG QR code check-in display; updated stat cards (Check-ins This Month, Classes Booked, Days Remaining); improved upcoming classes list with trainer names
- **Demo — Trainer dashboard** — Added green-to-teal gradient welcome banner "Trainer Panel — manage your clients, sessions and programs"; added 6-item Quick Actions grid (My Clients, PT Sessions, Workout Plans, Assessments, Progress, Messages); added Upcoming PT Sessions list; improved class list layout
- **Demo — Receptionist dashboard** — Replaced plain white occupancy card with blue/indigo gradient banner showing large occupancy %, "X of Y members inside" copy, circular SVG gauge, and 3 sub-stats; replaced emoji quick-action buttons with 2×2 color-coded action tiles; added "Open Check-in Station →" full-width CTA button
- **Demo — Login page** — Added Super Admin demo account button (full-width, red theme) to the collapsible demo accounts panel
- **API dev script** — Increased Node.js heap limit from 4 096 MB to 8 192 MB to prevent watch-mode OOM crashes (`--max-old-space-size=8192`); SWC builder with `typeCheck: false` was already configured in `nest-cli.json`

---

## [1.0.0] — 2025-06-01 (Initial release)

### Added
- Multi-tenant SaaS architecture with role-based access: Super Admin, Gym Owner, Branch Manager, Receptionist, Trainer, Member
- NestJS REST API (`apps/api`) with JWT authentication, guards, and Prisma ORM
- Next.js 14 App Router frontend (`apps/web`) with per-role dashboards
- Prisma schema with PostgreSQL (production) and SQLite (local dev) support
- Turbo monorepo pipeline (`turbo.json`) for parallel dev/build
- Owner dashboard — KPI cards (Active Members, Revenue, Check-ins, Churn), Revenue Area chart, Member Growth Bar chart, Quick Actions
- Member dashboard — membership card, QR code, class booking
- Trainer dashboard — client management, PT sessions, workout plans, assessments
- Receptionist dashboard — check-in station, occupancy monitor, visitor log
- Static demo app (`demo/`) — full single-page demo with hardcoded data, no backend required, served on port 3001
- Demo landing page matching real app: dark indigo/purple hero, 3-step how-it-works, stats bar, gym category grid, featured gyms, testimonials, member benefits, gym owner CTA
- Demo login page with collapsible demo accounts panel and links to register/discover flows
- Demo Discover page — gym search with 3 sample gym cards
- Demo Register (member) page — 3-step wizard: Choose gym → Pick plan → Account details
- Demo Register Gym page — 3-step wizard: Gym Details → Account → Choose Plan
- Playwright E2E tests covering landing, auth, and all owner dashboard navigation
- `build-server.js` — standalone server bundler for deployment without the monorepo
- `CREDENTIALS.md` — all demo/dev credentials reference
