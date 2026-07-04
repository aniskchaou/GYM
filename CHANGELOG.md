# Changelog

All notable changes to GymFlow SaaS are documented here.

---

## [Unreleased]

### Added — Training Content & Fitness Platform

**Prisma Schema**
- New `TrainingContent` model — `id`, `trainerId`, `gymId?`, `title`, `description`, `type` (VIDEO/AUDIO/PDF/LIVE_STREAM), `fileUrl`, `thumbnailUrl`, `duration`, `category`, `tags[]`, `visibility` (PUBLIC/MEMBERS_ONLY/SUBSCRIBERS_ONLY), `isPublished`, `publishedAt`, `viewCount`, `liveStreamAt`, `liveStreamUrl`
- New `ContentView` model — per-user watch progress tracking with `@@unique([contentId, userId])`
- New enums: `ContentType`, `ContentVisibility`
- Added `trainingContent` and `contentViews` relations to `User` model
- Added `trainingContent` relation to `Gym` model

**API (`apps/api`)**
- New `TrainingContentModule` — full CRUD + publish/unpublish/view-tracking (GET/POST/PATCH/DELETE `/training-content`)
- `POST /training-content/:id/publish` — publish a draft item
- `POST /training-content/:id/unpublish` — revert to draft
- `POST /training-content/:id/view` — track view progress (0–100 %)
- `GET /training-content/categories` — list unique content categories
- Role guards: create/edit restricted to `TRAINER`, `GYM_OWNER`, `BRANCH_MANAGER`; browse open to all authenticated users
- Upgraded `UploadsModule` from stub to working file handler:
  - `POST /uploads/video` — MP4/MOV/WebM up to 500 MB
  - `POST /uploads/audio` — MP3/WAV/M4A/OGG up to 100 MB
  - `POST /uploads/pdf` — PDF up to 20 MB
  - `POST /uploads/image` — JPG/PNG/WebP for thumbnails
  - Files saved to `uploads/{videos,audio,documents,images}/` with UUID filenames; served as static files

**Web (`apps/web`)**
- New page `apps/web/src/app/dashboard/trainer/content/page.tsx` — trainer content library: stat cards, type filter tabs, content grid with publish/unpublish/delete actions
- New page `apps/web/src/app/dashboard/trainer/content/new/page.tsx` — publish content form: content type picker, file upload with drag-and-drop, metadata (title, description, category, tags, duration, thumbnail), audience picker, save as draft / publish now
- New page `apps/web/src/app/dashboard/member/content/page.tsx` — member training library: search bar, category filter, type tabs, upcoming live streams banner (red gradient), content grid with inline video/audio player at bottom, PDF download, view progress tracking
- Added "My Content" quick action (🎬 rose) to trainer dashboard quick actions grid
- Added `My Content` nav item to Trainer sidebar
- Added `Training Library` nav item to Member sidebar

**Demo (`demo/`)**
- Added 9 demo `DEMO_CONTENT` items: 4 videos, 2 audio, 2 PDFs, 1 live stream
- `renderTrainerContent` — trainer content library with stats, type filter, published/draft grid, emoji type badges, upload CTA banner
- `renderMemberContent` — member training library with search, type tabs, live stream banner, content grid with play/download actions; state variables `mcFilter` / `mcSearch` preserved across re-renders
- `renderMemberHome` — added "Training Library" indigo/purple gradient shortcut button at bottom
- `renderTrainerHome` — added "My Content" (🎬) to Quick Actions grid
- Added `trainer-content` and `member-content` nav items to `NAV_ITEMS` for TRAINER and MEMBER roles respectively
- Added both new sub-pages to page titles map and `renderSubPage` switch

### Changed — App Scope: Gym + Fitness Platform
- The platform now supports **standalone trainers and fitness coaches** (not gym-affiliated): content can be published without a `gymId` (nullable on `TrainingContent`), enabling online-only personal trainers, yoga/Pilates instructors, nutritionists, and wellness coaches to use the system
- Content categories cover gym and non-gym fitness: Strength, HIIT, Yoga, Pilates, Cardio, CrossFit, Boxing, Nutrition, Mobility, Meditation, Running, Cycling, Swimming, Dance, Rehabilitation, Mental Wellness

---

### Added — Previous (Demo portal updates, Super Admin)

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
