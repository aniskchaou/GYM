# Build Server — GymFlow

Bundle the NestJS API + Next.js frontend into a single `server/` directory runnable with `node start.js`.

> **Single script:** everything lives in `build-server.js`.  
> The `server/start.js` entry point is generated automatically during the build — no second file to maintain.

---

## Prerequisites

- Node.js ≥ 18
- npm ≥ 9
- For **PostgreSQL** or **MySQL**: the database server must be running before `node start.js`
- For **SQLite**: nothing extra — a file is created automatically

---

## Step 1 — Install workspace dependencies

```bash
npm install
```

---

## Step 2 — Run the build script

### SQLite (default — zero config, no database server needed)

```bash
node build-server.js
```

### PostgreSQL

```bash
node build-server.js --db=postgresql
```

### MySQL

```bash
node build-server.js --db=mysql
```

### Custom frontend API URL (baked into the Next.js bundle)

```bash
node build-server.js --db=postgresql --api-url=http://myhost.com:4000
```

> **Note:** `NEXT_PUBLIC_API_URL` is embedded at build time.  
> If you deploy to a different host later, re-run the build with `--api-url=http://newhost:4000`.

### Shortcut npm scripts

| Command | Database |
|:--------|:---------|
| `npm run build:server` | SQLite |
| `npm run build:server:pg` | PostgreSQL |
| `npm run build:server:mysql` | MySQL |

### Skip recompile (reassemble only)

If you already built the apps and only want to reassemble `server/`:

```bash
node build-server.js --skip-build
```

---

## Step 3 — Configure environment

```bash
cd server
cp .env.example .env
```

Open `.env` and set at minimum:

```env
# Required — change both secrets before going to production
JWT_SECRET="use-at-least-32-random-characters-here"
JWT_REFRESH_SECRET="another-32-char-random-secret-here"

# Required for PostgreSQL / MySQL — not needed for SQLite
DATABASE_URL="postgresql://user:password@localhost:5432/gymflow"
```

Full list of variables is in `server/.env.example`.

---

## Step 4 — Start the server

```bash
node start.js
```

What happens on startup:

1. Loads `server/.env`
2. Defaults to **SQLite** (`data/gymflow.db`) if `DATABASE_URL` is not set
3. Runs `prisma db push` — creates / migrates the schema automatically
4. Starts **NestJS API** on `API_PORT` (default **4000**)
5. Starts **Next.js frontend** on `NEXT_PORT` (default **3000**)

```
╔══════════════════════════════════════════════╗
║          GymFlow is running!                 ║
╠══════════════════════════════════════════════╣
║  API      →  http://localhost:4000/api/v1    ║
║  Docs     →  http://localhost:4000/api/docs  ║
║  Frontend →  http://localhost:3000           ║
╚══════════════════════════════════════════════╝
```

---

## server/ directory structure

```
server/
├── api/
│   └── dist/            NestJS compiled JavaScript
├── web/
│   └── .next/           Next.js compiled output
├── prisma/
│   ├── schema.prisma    Patched for the chosen DB provider
│   └── migrations/      Migration history
├── data/                SQLite database file (created at runtime)
├── node_modules/        All production dependencies
├── start.js             Entry point
├── package.json         Production dependency manifest
├── .env.example         Configuration template
└── README.md            Quick-start guide
```

---

## Useful commands inside `server/`

| Command | Purpose |
|:--------|:--------|
| `npm start` | Start both servers |
| `npm run db:push` | Apply schema changes without migrations (dev / SQLite) |
| `npm run db:migrate` | Apply migration files (staging / production) |
| `npm run db:studio` | Open Prisma Studio in the browser |

---

## Switching databases after build

The Prisma client is compiled for a specific provider at build time.  
To switch providers, rebuild completely:

```bash
# Back in the project root:
node build-server.js --db=postgresql
```

---

## Troubleshooting

| Problem | Fix |
|:--------|:----|
| `api/dist/main.js not found` | Run the build script first |
| `prisma db push` fails | Check `DATABASE_URL` in `.env` and confirm the DB server is reachable |
| Frontend shows blank page | Verify `NEXT_PUBLIC_API_URL` matches where the API is actually running; if not, rebuild with `--api-url=...` |
| Port already in use | Set `API_PORT` or `NEXT_PORT` in `.env` |
| SQLite `ENOENT` on Windows | Ensure `data/` directory exists; the script creates it automatically on start |
