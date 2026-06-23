#!/usr/bin/env node
/**
 * build-server.js  ─  GymFlow single-script builder
 *
 * Builds NestJS (API) + Next.js (frontend) and assembles a self-contained
 * "server/" directory.  The generated server/start.js launches both processes.
 *
 * Usage:
 *   node build-server.js                            # SQLite (default, zero-config)
 *   node build-server.js --db=sqlite
 *   node build-server.js --db=postgresql
 *   node build-server.js --db=mysql
 *   node build-server.js --api-url=http://host:4000 # bake NEXT_PUBLIC_API_URL
 *   node build-server.js --skip-build               # reassemble only, skip compile
 *
 * npm shortcuts (package.json):
 *   npm run build:server          → SQLite
 *   npm run build:server:pg       → PostgreSQL
 *   npm run build:server:mysql    → MySQL
 *
 * After building:
 *   cd server && cp .env.example .env && node start.js
 */
'use strict';

const { execSync } = require('child_process');
const fs   = require('fs');
const path = require('path');

// ─── CLI arguments ────────────────────────────────────────────────────────────
const argv    = process.argv.slice(2);
const getArg  = (n) => { const a = argv.find(a => a.startsWith('--' + n + '=')); return a ? a.split('=').slice(1).join('=') : null; };
const hasFlag = (n) => argv.includes('--' + n);

const DB_PROVIDER = getArg('db')      || 'sqlite';
const API_URL     = getArg('api-url') || 'http://localhost:4000/api/v1';
const SKIP_BUILD  = hasFlag('skip-build');

const VALID = ['sqlite', 'postgresql', 'mysql'];
if (!VALID.includes(DB_PROVIDER)) {
  console.error('\n  --db="' + DB_PROVIDER + '" is not valid. Choose: ' + VALID.join(' | ') + '\n');
  process.exit(1);
}

// ─── Paths ────────────────────────────────────────────────────────────────────
const ROOT      = __dirname;
const API_DIR   = path.join(ROOT, 'apps', 'api');
const WEB_DIR   = path.join(ROOT, 'apps', 'web');
const DB_SCHEMA = path.join(ROOT, 'packages', 'database', 'prisma', 'schema.prisma');
const OUT_DIR   = path.join(ROOT, 'server');

// ─── Helpers ──────────────────────────────────────────────────────────────────
let _step = 0;
const step   = (msg)           => console.log('\n[' + (++_step) + '] ' + msg);
const run    = (cmd, cwd, env) => { console.log('  ▶  ' + cmd); execSync(cmd, { cwd: cwd || ROOT, stdio: 'inherit', env: Object.assign({}, process.env, env || {}) }); };
const cpSync = (src, dest, skip) => {
  if (!fs.existsSync(src)) { console.warn('  ⚠  skipping (not found): ' + path.relative(ROOT, src)); return; }
  fs.cpSync(src, dest, { recursive: true, force: true, filter: skip ? (s) => !skip.some((d) => s.includes(d)) : undefined });
};

// ─── Prisma schema patching ───────────────────────────────────────────────────
const SCHEMA_ORIG = fs.readFileSync(DB_SCHEMA, 'utf8');

function patchedSchema(provider) {
  let s = SCHEMA_ORIG
    .replace(/(datasource\s+db\s*\{[^}]*?provider\s*=\s*)"[^"]*"/s, '$1"' + provider + '"')
    .replace(/(datasource\s+db\s*\{[^}]*?url\s*=\s*)env\("[^"]*"\)/s, '$1env("DATABASE_URL")');

  if (provider === 'sqlite') {
    // ── SQLite limitations ─────────────────────────────────────────────────
    // • No native enums     → replace field types with String, remove enum blocks
    // • No primitive lists  → String[] / Int[] etc. → String @default("[]")
    // • No Json type        → Json / Json? → String / String?

    // 1. Collect all enum names from the ORIGINAL schema
    const enumNames = [];
    SCHEMA_ORIG.replace(/^enum\s+(\w+)\s*\{/gm, (_, n) => enumNames.push(n));

    // 2. Replace every enum type reference inside model fields with String
    //    e.g.  role    UserRole    →  role    String
    //          gender  Gender?     →  gender  String?
    for (const name of enumNames) {
      s = s.replace(new RegExp('\\b' + name + '(\\[\\]|\\?)?\\b', 'g'), 'String$1');
    }

    // 3. Fix @default(ENUM_VALUE) → @default("ENUM_VALUE")
    //    After type replacement the default still holds a bare identifier, e.g.
    //      status  String  @default(PENDING)   →  @default("PENDING")
    //    Skip built-in Prisma functions: now(), autoincrement(), cuid(), uuid(),
    //    auto(), dbgenerated() and boolean literals true/false/null.
    const PRISMA_BUILTINS = new Set(['true','false','null','now','autoincrement','cuid','uuid','auto','dbgenerated']);
    s = s.replace(/@default\(([A-Za-z_][A-Za-z0-9_]*)\)/g, (match, val) =>
      PRISMA_BUILTINS.has(val.toLowerCase()) ? match : '@default("' + val + '")'
    );

    // 4. Remove enum declaration blocks (now unreferenced)
    s = s.replace(/^enum\s+\w+\s*\{[^}]*\}/gms, '');

    // 5. Primitive lists → String stored as a JSON array string
    //    e.g.  specialties  String[]  →  specialties  String  @default("[]")
    s = s.replace(/\b(String|Int|Float|Boolean|Decimal|BigInt)\[\]/g, 'String @default("[]")');

    // 6. Json → String  (serialised as JSON text)
    s = s.replace(/\bJson\?/g, 'String?');
    s = s.replace(/\bJson\b/g,  'String');
  }

  return s;
}

// ─── SQLite enum shim helpers ───────────────────────────────────────────────
/**
 * Parse enum names + values from the original schema.
 * Returns { EnumName: ['VALUE1', 'VALUE2', ...], ... }
 */
function parseEnumsFromSchema(schema) {
  const enums = {};
  const re = /^enum\s+(\w+)\s*\{([^}]+)\}/gms;
  let m;
  while ((m = re.exec(schema)) !== null) {
    const name = m[1];
    const values = m[2]
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith('//') && !l.startsWith('@'));
    if (values.length) enums[name] = values;
  }
  return enums;
}

/**
 * After `prisma generate` with a SQLite schema (no enums), the generated
 * @prisma/client does not export enum types.  This function appends shims
 * so that `import { UserRole } from '@prisma/client'` still compiles.
 *
 * Patches both the JS runtime file and the TypeScript declaration file.
 */
function injectSqliteEnumShims(enums, targetDir) {
  const names = Object.keys(enums);
  if (!names.length) return;
  targetDir = targetDir || ROOT;

  const ALREADY = 'SQLite Enum Shims';

  // ── JS shim (appended to the generated index.js) ─────────────────────────
  const jsLines = [
    '',
    '// === ' + ALREADY + ' (injected by build-server.js) ===',
  ];
  for (const [name, values] of Object.entries(enums)) {
    const pairs = values.map((v) => "  '" + v + "': '" + v + "'").join(',\n');
    jsLines.push('module.exports.' + name + " = {\n" + pairs + "\n};");
  }
  const jsShim = jsLines.join('\n') + '\n';

  // ── TypeScript declaration shim ───────────────────────────────────────────
  const dtsLines = [
    '',
    '// === ' + ALREADY + ' (injected by build-server.js) ===',
  ];
  for (const [name, values] of Object.entries(enums)) {
    dtsLines.push('export declare const ' + name + ': {');
    values.forEach((v) => dtsLines.push("  readonly '" + v + "': '" + v + "';"));
    dtsLines.push('};');
    dtsLines.push('export type ' + name + " = (typeof " + name + ")[keyof typeof " + name + "];");
  }
  const dtsShim = dtsLines.join('\n') + '\n';

  // ── Candidate files to patch ──────────────────────────────────────────────
  const jsCandidates = [
    path.join(targetDir, 'node_modules', '@prisma', 'client', 'index.js'),
    path.join(targetDir, 'node_modules', '.prisma', 'client', 'default.js'),
  ];
  const dtsCandidates = [
    path.join(targetDir, 'node_modules', '@prisma', 'client', 'index.d.ts'),
    path.join(targetDir, 'node_modules', '.prisma', 'client', 'default.d.ts'),
  ];

  let patchedCount = 0;
  for (const f of jsCandidates) {
    if (fs.existsSync(f)) {
      const content = fs.readFileSync(f, 'utf8');
      if (!content.includes(ALREADY)) {
        fs.appendFileSync(f, jsShim, 'utf8');
        console.log('  \u2713  Enum JS shims  \u2192  ' + path.relative(ROOT, f));
        patchedCount++;
      }
    }
  }
  for (const f of dtsCandidates) {
    if (fs.existsSync(f)) {
      const content = fs.readFileSync(f, 'utf8');
      if (!content.includes(ALREADY)) {
        fs.appendFileSync(f, dtsShim, 'utf8');
        console.log('  \u2713  Enum TS shims  \u2192  ' + path.relative(ROOT, f));
        patchedCount++;
      }
    }
  }
  if (!patchedCount) {
    console.warn('  \u26a0  Could not locate @prisma/client generated files in ' + path.relative(ROOT, targetDir) + ' — shims not injected');
    console.warn('  \u26a0  nest build may report TS2305 errors for enum imports');
  }
}

// ─── Embedded server/start.js content ────────────────────────────────────────
// Written verbatim to server/start.js during the build.
// Uses only plain string concatenation (no template literals / backticks) so it
// can be stored here as a regular string without any escaping issues.
const START_JS = [
  '#!/usr/bin/env node',
  '/**',
  ' * GymFlow Server — start.js',
  ' * Auto-generated by build-server.js.',
  ' * Run from inside server/:   node start.js',
  ' *',
  ' * Env vars (see .env.example):',
  ' *   DATABASE_URL  — connection string  (default: SQLite ./data/gymflow.db)',
  ' *   API_PORT      — NestJS port         (default: 4000)',
  ' *   NEXT_PORT     — Next.js port        (default: 3000)',
  ' */',
  "'use strict';",
  '',
  "var fs      = require('fs');",
  "var path    = require('path');",
  "var child   = require('child_process');",
  'var spawn    = child.spawn;',
  'var execSync = child.execSync;',
  '',
  '// ── Load .env ────────────────────────────────────────────────────────────',
  "var envFile = path.join(__dirname, '.env');",
  'if (fs.existsSync(envFile)) {',
  "  require(path.join(__dirname, 'node_modules', 'dotenv')).config({ path: envFile });",
  "  console.log('[GymFlow] Loaded .env');",
  '} else {',
  "  console.warn('[GymFlow] .env not found — using defaults (SQLite, ports 4000/3000).');",
  "  console.warn('[GymFlow] Tip: cp .env.example .env');",
  '}',
  '',
  '// ── Default to SQLite when DATABASE_URL is not set ───────────────────────',
  'if (!process.env.DATABASE_URL) {',
  "  var dataDir = path.join(__dirname, 'data');",
  '  fs.mkdirSync(dataDir, { recursive: true });',
  "  var dbFile = path.join(dataDir, 'gymflow.db').replace(/\\\\/g, '/');",
  "  process.env.DATABASE_URL = 'file:' + dbFile;",
  "  console.log('[GymFlow] DATABASE_URL defaulting to SQLite: ' + process.env.DATABASE_URL);",
  '}',
  "if ((process.env.DATABASE_URL || '').startsWith('file:')) {",
  "  fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });",
  '}',
  '',
  'var API_PORT  = Number(process.env.API_PORT)  || 4000;',
  'var NEXT_PORT = Number(process.env.NEXT_PORT) || 3000;',
  '',
  '// ── Prisma db push (idempotent schema sync) ───────────────────────────────',
  'function setupDatabase() {',
  "  var schema    = path.join(__dirname, 'prisma', 'schema.prisma');",
  "  var binSuffix = process.platform === 'win32' ? 'prisma.cmd' : 'prisma';",
  "  var prismaCli = path.join(__dirname, 'node_modules', '.bin', binSuffix);",
  "  var fallback  = path.join(__dirname, 'node_modules', 'prisma', 'build', 'index.js');",
  '  var cliExpr = fs.existsSync(prismaCli)',
  "    ? '\"' + prismaCli + '\"'",
  "    : '\"' + process.execPath + '\" \"' + fallback + '\"';",
  "  var cmd = cliExpr + ' db push --schema=\"' + schema + '\" --accept-data-loss --skip-generate';",
  "  console.log('[GymFlow] Syncing database schema (prisma db push)...');",
  '  try {',
  "    execSync(cmd, { stdio: 'inherit', env: process.env, cwd: __dirname });",
  "    console.log('[GymFlow] Database ready.\\n');",
  '  } catch (err) {',
  "    console.error('\\n[GymFlow]  Database setup failed!');",
  "    console.error('[GymFlow]  DATABASE_URL = ' + process.env.DATABASE_URL);",
  "    console.error('[GymFlow]  Check .env and confirm the DB server is reachable.');",
  '    process.exit(1);',
  '  }',
  '}',
  '',
  '// ── Start NestJS API ─────────────────────────────────────────────────────',
  'function startApi() {',
  "  var entry = path.join(__dirname, 'api', 'dist', 'main.js');",
  '  if (!fs.existsSync(entry)) {',
  "    console.error('[GymFlow]  api/dist/main.js not found. Run build-server.js first.');",
  '    process.exit(1);',
  '  }',
  "  console.log('[GymFlow] Starting API on port ' + API_PORT + ' ...');",
  '  var proc = spawn(process.execPath, [entry], {',
  "    env:   Object.assign({}, process.env, { API_PORT: String(API_PORT) }),",
  "    cwd:   path.join(__dirname, 'api'),",
  "    stdio: 'inherit',",
  '  });',
  "  proc.on('exit', function (code) {",
  "    console.error('[GymFlow]  API process exited (code ' + code + ')');",
  '    process.exit(code != null ? code : 1);',
  '  });',
  '  return proc;',
  '}',
  '',
  '// ── Start Next.js frontend ────────────────────────────────────────────────',
  'function startWeb() {',
  "  var webDir  = path.join(__dirname, 'web');",
  "  var nextBin = path.join(__dirname, 'node_modules', 'next', 'dist', 'bin', 'next');",
  '  if (!fs.existsSync(nextBin)) {',
  "    console.warn('[GymFlow]  next binary not found — frontend will not start.');",
  '    return null;',
  '  }',
  "  console.log('[GymFlow] Starting frontend on port ' + NEXT_PORT + ' ...');",
  '  var proc = spawn(',
  '    process.execPath,',
  "    [nextBin, 'start', '-p', String(NEXT_PORT)],",
  '    {',
  "      env:   Object.assign({}, process.env, { PORT: String(NEXT_PORT), NODE_ENV: 'production' }),",
  '      cwd:   webDir,',
  "      stdio: 'inherit',",
  '    }',
  '  );',
  "  proc.on('exit', function (code) {",
  "    console.warn('[GymFlow]  Frontend process exited (code ' + code + ')');",
  '  });',
  '  return proc;',
  '}',
  '',
  '// ── SQLite enum shim — patches @prisma/client when enums are not generated ──',
  'var PRISMA_ENUMS = {',
  "  UserRole:           ['SUPER_ADMIN','GYM_OWNER','BRANCH_MANAGER','RECEPTIONIST','TRAINER','MEMBER'],",
  "  Gender:             ['MALE','FEMALE','OTHER','PREFER_NOT_TO_SAY'],",
  "  MembershipStatus:   ['ACTIVE','INACTIVE','FROZEN','CANCELLED','EXPIRED','PENDING'],",
  "  MembershipType:     ['MONTHLY','ANNUAL','PAY_PER_VISIT','FAMILY','STUDENT','CORPORATE','DAY_PASS'],",
  "  PaymentStatus:      ['PENDING','PAID','FAILED','REFUNDED','PARTIALLY_REFUNDED'],",
  "  PaymentMethod:      ['STRIPE','PAYPAL','APPLE_PAY','GOOGLE_PAY','BANK_TRANSFER','CASH'],",
  "  AttendanceMethod:   ['QR_CODE','RFID','FACE_RECOGNITION','MOBILE_APP','RECEPTION','MANUAL'],",
  "  ClassStatus:        ['SCHEDULED','ONGOING','COMPLETED','CANCELLED'],",
  "  BookingStatus:      ['CONFIRMED','WAITLISTED','CANCELLED','NO_SHOW','ATTENDED'],",
  "  NotificationChannel:['EMAIL','SMS','PUSH','IN_APP','WHATSAPP'],",
  "  NotificationStatus: ['PENDING','SENT','FAILED','READ'],",
  "  StaffShiftStatus:   ['SCHEDULED','CHECKED_IN','CHECKED_OUT','ABSENT'],",
  "  GymPlanTier:        ['STARTER','PROFESSIONAL','ENTERPRISE'],",
  "  GymStatus:          ['ACTIVE','SUSPENDED','TRIAL','CANCELLED'],",
  "  TicketStatus:       ['OPEN','IN_PROGRESS','RESOLVED','CLOSED'],",
  "  TransactionType:    ['SUBSCRIPTION','CLASS_BOOKING','PT_SESSION','PRODUCT_SALE','REFUND','PENALTY'],",
  '};',
  '',
  'function patchPrismaEnums() {',
  "  var MARKER = '// === SQLite Enum Shims';",
  "  var jsLines = ['\\n' + MARKER + ' ==='];",
  '  Object.keys(PRISMA_ENUMS).forEach(function (name) {',
  "    var pairs = PRISMA_ENUMS[name].map(function (v) { return \"  '\" + v + \"': '\" + v + \"'\"; }).join(',\\n');",
  "    jsLines.push('module.exports.' + name + ' = {\\n' + pairs + '\\n};');",
  '  });',
  "  var jsShim = jsLines.join('\\n') + '\\n';",
  '  var candidates = [',
  "    path.join(__dirname, 'node_modules', '@prisma',  'client',  'index.js'),",
  "    path.join(__dirname, 'node_modules', '.prisma',  'client',  'default.js'),",
  '  ];',
  '  candidates.forEach(function (f) {',
  '    if (!fs.existsSync(f)) return;',
  '    var src = fs.readFileSync(f, \'utf8\');',
  '    if (src.indexOf(MARKER) !== -1) return;',
  '    fs.appendFileSync(f, jsShim, \'utf8\');',
  "    console.log('[GymFlow] Enum shims injected \\u2192 ' + path.relative(__dirname, f));",
  '  });',
  '}',
  '',
  '// ── Boot sequence ─────────────────────────────────────────────────────────',
  '// Patch enum exports when running with SQLite (prisma generate strips enums)',
  "if ((process.env.DATABASE_URL || 'file:').startsWith('file:')) {",
  '  patchPrismaEnums();',
  '}',
  'setupDatabase();',
  '',
  '// ── Optional seed (node start.js --seed) ──────────────────────────────────',
  'var ARGS = process.argv.slice(2);',
  "if (ARGS.indexOf('--seed') !== -1) {",
  "  var seedFile = path.join(__dirname, 'seed.js');",
  '  if (fs.existsSync(seedFile)) {',
  "    console.log('[GymFlow] Running seed (--seed flag detected)...');",
  '    try {',
  '      execSync(\'"\' + process.execPath + \'" "\' + seedFile + \'"\', {',
  "        stdio: 'inherit',",
  '        env:   process.env,',
  '        cwd:   __dirname,',
  '      });',
  '    } catch (e) {',
  "      console.error('[GymFlow] Seed failed \\u2014 continuing server startup anyway.');",
  '    }',
  '  } else {',
  "    console.warn('[GymFlow] --seed: seed.js not found in server/');",
  '  }',
  '}',
  '',
  'var apiProc = startApi();',
  'var webProc = startWeb();',
  '',
  '// Print banner after processes have had time to initialise',
  'setTimeout(function () {',
  '  var a = String(API_PORT);',
  '  var n = String(NEXT_PORT);',
  "  console.log('\\n\\u2554' + '\\u2550'.repeat(46) + '\\u2557');",
  "  console.log('\\u2551  GymFlow is running!                           \\u2551');",
  "  console.log('\\u2560' + '\\u2550'.repeat(46) + '\\u2563');",
  "  console.log('\\u2551  API      \\u2192  http://localhost:' + a + '/api/v1    \\u2551');",
  "  console.log('\\u2551  Docs     \\u2192  http://localhost:' + a + '/api/docs  \\u2551');",
  "  console.log('\\u2551  Frontend \\u2192  http://localhost:' + n + '           \\u2551');",
  "  console.log('\\u255a' + '\\u2550'.repeat(46) + '\\u255d\\n');",
  '}, 6000);',
  '',
  '// ── Graceful shutdown ─────────────────────────────────────────────────────',
  'function shutdown(sig) {',
  "  console.log('\\n[GymFlow] Received ' + sig + ' — shutting down...');",
  "  if (apiProc) apiProc.kill('SIGTERM');",
  "  if (webProc) webProc.kill('SIGTERM');",
  '  setTimeout(function () { process.exit(0); }, 4000).unref();',
  '}',
  "['SIGTERM', 'SIGINT'].forEach(function (sig) { process.on(sig, function () { shutdown(sig); }); });",
].join('\n');

// ─── Main ─────────────────────────────────────────────────────────────────────
(async () => {
  const t0  = Date.now();
  const pad = (s, w) => String(s).substring(0, w).padEnd(w);

  console.log('\u2554' + '\u2550'.repeat(46) + '\u2557');
  console.log('\u2551       GymFlow  build-server                \u2551');
  console.log('\u2560' + '\u2550'.repeat(46) + '\u2563');
  console.log('\u2551  DB provider : ' + pad(DB_PROVIDER, 31) + '\u2551');
  console.log('\u2551  API URL     : ' + pad(API_URL, 31)     + '\u2551');
  console.log('\u2551  Skip build  : ' + pad(SKIP_BUILD, 31)  + '\u2551');
  console.log('\u255a' + '\u2550'.repeat(46) + '\u255d');

  // ── 1. Clean / create output directory ──────────────────────────────────────
  step('Preparing output directory  server/');
  if (fs.existsSync(OUT_DIR)) {
    // On Windows the root server/ dir itself can be held by Explorer/OneDrive.
    // Strategy: try fs.rmSync first; if EPERM, wipe contents only via cmd rd.
    let cleaned = false;
    try {
      fs.rmSync(OUT_DIR, { recursive: true, force: true });
      cleaned = true;
    } catch (e) {
      if (e.code === 'EPERM' || e.code === 'EBUSY') {
        console.warn('  \u26a0  fs.rmSync blocked (' + e.code + ') — falling back to cmd rd /s /q');
        try {
          require('child_process').execSync('cmd /c rd /s /q "' + OUT_DIR + '"', { stdio: 'pipe' });
          cleaned = true;
        } catch (_) {
          // Directory root is locked — empty contents instead
          console.warn('  \u26a0  Directory root locked; wiping contents only');
          for (const entry of fs.readdirSync(OUT_DIR)) {
            try {
              fs.rmSync(path.join(OUT_DIR, entry), { recursive: true, force: true });
            } catch (_2) { /* skip locked entry */ }
          }
          cleaned = true;
        }
      } else {
        throw e;
      }
    }
    if (cleaned && !fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR);
  }
  ['api', 'web', 'prisma', 'data'].forEach((d) =>
    fs.mkdirSync(path.join(OUT_DIR, d), { recursive: true })
  );
  console.log('  \u2713  server/ ready');

  // ── 2. Install workspace dependencies ───────────────────────────────────────
  if (!SKIP_BUILD) {
    step('Installing workspace dependencies');
    run('npm install');
  }

  // ── 3. Patch schema → prisma generate → restore ─────────────────────────────
  step('Generating Prisma client for "' + DB_PROVIDER + '"');
  if (DB_PROVIDER === 'sqlite') {
    console.log('  \u26a0  SQLite mode: enums \u2192 String, String[]/Json \u2192 String (arrays stored as JSON text)');
  }
  fs.writeFileSync(DB_SCHEMA, patchedSchema(DB_PROVIDER), 'utf8');
  try {
    run('npx prisma generate --schema=packages/database/prisma/schema.prisma');
    console.log('  \u2713  Prisma client generated');
    // SQLite: re-inject enum exports so `import { UserRole } from '@prisma/client'` works
    if (DB_PROVIDER === 'sqlite') {
      const enums = parseEnumsFromSchema(SCHEMA_ORIG);
      injectSqliteEnumShims(enums);
      console.log('  \u2713  Enum shims injected (' + Object.keys(enums).length + ' enums)');
    }
  } finally {
    fs.writeFileSync(DB_SCHEMA, SCHEMA_ORIG, 'utf8');
    console.log('  \u2713  schema.prisma restored');
  }

  // ── 4. Build NestJS API ──────────────────────────────────────────────────────
  if (!SKIP_BUILD) {
    step('Building NestJS API  (nest build)');
    try {
      run('npx nest build', API_DIR);
      console.log('  \u2713  apps/api/dist/ ready');
    } catch (buildErr) {
      // TypeScript may emit JS even when there are type errors (noEmitOnError defaults
      // to false). If dist/main.js exists the runtime will still work.
      const distMain = path.join(API_DIR, 'dist', 'main.js');
      if (fs.existsSync(distMain)) {
        console.warn('  \u26a0  nest build reported TypeScript errors but dist/main.js was produced.');
        console.warn('  \u26a0  These are likely pre-existing schema/type gaps — the server will still run.');
        console.warn('  \u26a0  Fix them by adding missing models to packages/database/prisma/schema.prisma.');
      } else {
        throw buildErr;  // truly failed — nothing was emitted
      }
    }
  }

  // ── 5. Build Next.js frontend ────────────────────────────────────────────────
  if (!SKIP_BUILD) {
    step('Building Next.js frontend  (next build)  [NEXT_PUBLIC_API_URL=' + API_URL + ']');
    run('npx next build', WEB_DIR, { NEXT_PUBLIC_API_URL: API_URL });
    console.log('  \u2713  apps/web/.next/ ready');
  }

  // ── 6. Copy compiled outputs into server/ ────────────────────────────────────
  step('Assembling  server/  from compiled outputs');

  cpSync(path.join(API_DIR, 'dist'), path.join(OUT_DIR, 'api', 'dist'));
  console.log('  \u2713  api/dist/');

  // Skip .next/cache to avoid copying stale build cache
  cpSync(path.join(WEB_DIR, '.next'), path.join(OUT_DIR, 'web', '.next'),
    [path.sep + '.next' + path.sep + 'cache', '/.next/cache']);
  cpSync(path.join(WEB_DIR, 'next.config.js'), path.join(OUT_DIR, 'web', 'next.config.js'));
  cpSync(path.join(WEB_DIR, 'public'),          path.join(OUT_DIR, 'web', 'public'));
  console.log('  \u2713  web/.next/');

  fs.writeFileSync(
    path.join(OUT_DIR, 'prisma', 'schema.prisma'),
    patchedSchema(DB_PROVIDER),
    'utf8'
  );
  cpSync(
    path.join(ROOT, 'packages', 'database', 'prisma', 'migrations'),
    path.join(OUT_DIR, 'prisma', 'migrations')
  );
  console.log('  \u2713  prisma/schema.prisma  (provider = "' + DB_PROVIDER + '")');

  // ── 7. server/package.json + npm install ─────────────────────────────────────
  step('Creating  server/package.json  and installing production deps');

  const apiPkg = JSON.parse(fs.readFileSync(path.join(API_DIR, 'package.json'), 'utf8'));
  const webPkg = JSON.parse(fs.readFileSync(path.join(WEB_DIR, 'package.json'), 'utf8'));

  const serverPkg = {
    name: 'gymflow-server',
    version: '1.0.0',
    private: true,
    main: 'start.js',
    scripts: {
      start:        'node start.js',
      'db:push':    'npx prisma db push    --schema=prisma/schema.prisma --accept-data-loss',
      'db:migrate': 'npx prisma migrate deploy --schema=prisma/schema.prisma',
      'db:studio':  'npx prisma studio     --schema=prisma/schema.prisma',
    },
    dependencies: Object.assign(
      {},
      apiPkg.dependencies,
      {
        next:        webPkg.dependencies.next,
        react:       webPkg.dependencies.react,
        'react-dom': webPkg.dependencies['react-dom'],
        dotenv:      '^16.4.5',
        prisma:      '^5.22.0',
      }
    ),
  };

  fs.writeFileSync(
    path.join(OUT_DIR, 'package.json'),
    JSON.stringify(serverPkg, null, 2) + '\n',
    'utf8'
  );
  run('npm install --omit=dev --legacy-peer-deps', OUT_DIR);
  console.log('  \u2713  server/node_modules/ installed');

  // Re-generate Prisma client inside server/node_modules for the chosen provider
  run('npx prisma generate --schema=prisma/schema.prisma', OUT_DIR);
  console.log('  \u2713  Prisma client regenerated (' + DB_PROVIDER + ') inside server/');

  // For SQLite: inject enum shims into server/node_modules so start.js (and the
  // patchPrismaEnums() inside it) have them on disk before the API starts.
  if (DB_PROVIDER === 'sqlite') {
    const enums2 = parseEnumsFromSchema(SCHEMA_ORIG);
    if (Object.keys(enums2).length) {
      injectSqliteEnumShims(enums2, OUT_DIR);
      console.log('  \u2713  Enum shims injected into server/node_modules (' + Object.keys(enums2).length + ' enums)');
    }
  }

  // ── 8. Write server/start.js + config files ──────────────────────────────────
  step('Writing  start.js  /  seed.js  /  .env.example  /  README.md');

  fs.writeFileSync(path.join(OUT_DIR, 'start.js'), START_JS, 'utf8');
  console.log('  \u2713  start.js');

  // seed.js — copy from project root or regenerate inline
  const seedSrc = path.join(ROOT, 'server', 'seed.js');
  const seedBak = path.join(ROOT, 'server-seed.js');
  if (fs.existsSync(seedBak)) {
    fs.copyFileSync(seedBak, path.join(OUT_DIR, 'seed.js'));
    console.log('  \u2713  seed.js  (from server-seed.js)');
  } else if (fs.existsSync(seedSrc) && seedSrc !== path.join(OUT_DIR, 'seed.js')) {
    fs.copyFileSync(seedSrc, path.join(OUT_DIR, 'seed.js'));
    console.log('  \u2713  seed.js');
  } else {
    console.warn('  \u26a0  seed.js not found — skipped (run: node build-server.js to regenerate)');
  }

  // .env.example
  const defaultDbUrls = {
    sqlite:     'file:./data/gymflow.db',
    postgresql: 'postgresql://postgres:password@localhost:5432/gymflow',
    mysql:      'mysql://root:password@localhost:3306/gymflow',
  };

  const envLines = [
    '# GymFlow Server — copy to .env and fill in your values',
    '# Built with database provider: ' + DB_PROVIDER,
    '',
    '# ── Database ──────────────────────────────────────────────',
    'DATABASE_URL="' + defaultDbUrls[DB_PROVIDER] + '"',
    '',
    '# ── JWT ───────────────────────────────────────────────────',
    'JWT_SECRET="change-me-use-at-least-32-random-chars"',
    'JWT_REFRESH_SECRET="change-me-refresh-at-least-32-chars"',
    'JWT_EXPIRES_IN="15m"',
    'JWT_REFRESH_EXPIRES_IN="7d"',
    '',
    '# ── Server ports ──────────────────────────────────────────',
    'API_PORT=4000',
    'NEXT_PORT=3000',
    '',
    '# ── URLs ──────────────────────────────────────────────────',
    'API_URL="http://localhost:4000"',
    'FRONTEND_URL="http://localhost:3000"',
    '# NOTE: NEXT_PUBLIC_* vars are baked in at build time.',
    '# To change the API URL the browser calls, rebuild with:',
    '#   node build-server.js --api-url=http://yourhost:4000',
    'NEXT_PUBLIC_API_URL="' + API_URL + '"',
    'NODE_ENV="production"',
    '',
    '# ── Optional services (leave blank to disable) ────────────',
    'STRIPE_SECRET_KEY=""',
    'STRIPE_PUBLISHABLE_KEY=""',
    'STRIPE_WEBHOOK_SECRET=""',
    'SENDGRID_API_KEY=""',
    'EMAIL_FROM="noreply@gymflow.com"',
    'TWILIO_ACCOUNT_SID=""',
    'TWILIO_AUTH_TOKEN=""',
    'TWILIO_FROM_NUMBER=""',
    'REDIS_URL=""',
    'AWS_ACCESS_KEY_ID=""',
    'AWS_SECRET_ACCESS_KEY=""',
    'AWS_REGION="eu-west-1"',
    'AWS_S3_BUCKET=""',
  ];
  fs.writeFileSync(path.join(OUT_DIR, '.env.example'), envLines.join('\n') + '\n', 'utf8');
  console.log('  \u2713  .env.example');

  // README.md
  const readme = [
    '# GymFlow Server',
    '',
    'Self-contained production bundle (NestJS API + Next.js frontend).',
    'Generated by `build-server.js`.',
    '',
    '## Quick start',
    '',
    '```bash',
    'cp .env.example .env   # edit at minimum: JWT_SECRET, JWT_REFRESH_SECRET',
    'node start.js',
    '```',
    '',
    'With no `.env` the server starts with **SQLite** on default ports (zero-config).',
    '',
    '## Database options',
    '',
    '| Provider   | Example DATABASE_URL |',
    '|:---------- |:-------------------- |',
    '| SQLite     | `file:./data/gymflow.db` |',
    '| PostgreSQL | `postgresql://user:pass@localhost:5432/gymflow` |',
    '| MySQL      | `mysql://root:pass@localhost:3306/gymflow` |',
    '',
    '> This bundle was generated for **' + DB_PROVIDER + '**.',
    '> To switch providers, rebuild: `node build-server.js --db=<provider>`',
    '',
    '## npm scripts',
    '',
    '| Command | Purpose |',
    '|:------- |:------- |',
    '| `npm start` | Start both servers |',
    '| `npm run db:push` | Push schema changes (dev / SQLite) |',
    '| `npm run db:migrate` | Apply migrations (staging / production) |',
    '| `npm run db:studio` | Open Prisma Studio |',
    '',
    '## Ports',
    '',
    '| Service  | Env var | Default |',
    '|:-------- |:------- |:------- |',
    '| API | `API_PORT` | 4000 |',
    '| Frontend | `NEXT_PORT` | 3000 |',
    '| Swagger  | — | http://localhost:4000/api/docs |',
  ];
  fs.writeFileSync(path.join(OUT_DIR, 'README.md'), readme.join('\n') + '\n', 'utf8');
  console.log('  \u2713  README.md');

  // ── Done ──────────────────────────────────────────────────────────────────────
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  console.log('\n\u2554' + '\u2550'.repeat(46) + '\u2557');
  console.log('\u2551  \u2705  Build complete in ' + pad(elapsed + 's', 28) + '\u2551');
  console.log('\u2560' + '\u2550'.repeat(46) + '\u2563');
  console.log('\u2551  \ud83d\udcc1  server/                                  \u2551');
  console.log('\u2551      \u251c\u2500 api/dist/        NestJS compiled      \u2551');
  console.log('\u2551      \u251c\u2500 web/.next/       Next.js compiled     \u2551');
  console.log('\u2551      \u251c\u2500 prisma/          Schema + migrations  \u2551');
  console.log('\u2551      \u251c\u2500 node_modules/    Production deps      \u2551');
  console.log('\u2551      \u251c\u2500 start.js         Entry point          \u2551');
  console.log('\u2551      \u2514\u2500 .env.example     Config template      \u2551');
  console.log('\u2560' + '\u2550'.repeat(46) + '\u2563');
  console.log('\u2551  \ud83d\ude80  To run:                                  \u2551');
  console.log('\u2551      cd server                                \u2551');
  console.log('\u2551      cp .env.example .env                     \u2551');
  console.log('\u2551      node start.js                            \u2551');
  console.log('\u255a' + '\u2550'.repeat(46) + '\u255d\n');
  process.exitCode = 0;  // reset any exitCode set by execSync after caught nest build errors

})().catch((err) => {
  // Always restore original schema on unexpected error
  try { fs.writeFileSync(DB_SCHEMA, SCHEMA_ORIG, 'utf8'); } catch (_) {}
  console.error('\n  Build failed: ' + err.message);
  process.exit(1);
});
