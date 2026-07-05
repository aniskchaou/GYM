#!/usr/bin/env node
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');

const HOST = '127.0.0.1';
const PORT = 3030;
const ROOT_DIR = __dirname;
const API_ENV_PATH = path.join(ROOT_DIR, 'apps', 'api', '.env');
const DB_ENV_PATH = path.join(ROOT_DIR, 'packages', 'database', '.env');
const WEB_ENV_PATH = path.join(ROOT_DIR, 'apps', 'web', '.env.local');

let isInstalling = false;
let activeLogs = [];
let processRegistry = {
  all: null,
  api: null,
  web: null
};

function now() {
  return new Date().toLocaleTimeString();
}

function pushLog(source, message) {
  activeLogs.push({
    time: now(),
    source,
    message: String(message).trim()
  });

  if (activeLogs.length > 700) {
    activeLogs = activeLogs.slice(activeLogs.length - 700);
  }
}

function checkCommand(cmd) {
  try {
    execSync(`${cmd} --version`, { stdio: 'ignore', timeout: 1500 });
    return true;
  } catch {
    return false;
  }
}

let cachedPrerequisites = {
  node: true,
  npm: true,
  git: false,
  allPassed: true
};

let lastPrereqCheckAt = 0;

function getPrerequisitesCached() {
  const nowMs = Date.now();
  if (nowMs - lastPrereqCheckAt > 8000) {
    cachedPrerequisites = getPrerequisites();
    lastPrereqCheckAt = nowMs;
  }
  return cachedPrerequisites;
}

function getPrerequisites() {
  const node = checkCommand('node');
  const npm = checkCommand('npm');
  const git = checkCommand('git');

  return {
    node,
    npm,
    git,
    allPassed: node && npm
  };
}

function parseEnvFile(filePath) {
  const map = {};
  if (!fs.existsSync(filePath)) return map;

  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx <= 0) continue;
    const key = trimmed.slice(0, idx).trim();
    const raw = trimmed.slice(idx + 1).trim();
    map[key] = raw.replace(/^"|"$/g, '');
  }
  return map;
}

function upsertEnvFile(filePath, updates) {
  const current = parseEnvFile(filePath);
  const merged = { ...current, ...updates };
  const keys = Object.keys(merged).sort();
  const lines = keys.map(k => {
    const val = String(merged[k]);
    if (val.includes(' ') || val.includes(':') || val.includes('/')) {
      return `${k}="${val}"`;
    }
    return `${k}=${val}`;
  });

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${lines.join('\n')}\n`, 'utf8');
}

function parseDbUrl(url) {
  if (!url || !url.startsWith('postgresql://')) {
    return {
      dialect: 'postgresql',
      host: 'localhost',
      port: '5432',
      database: 'gymflow',
      user: 'gymflow',
      password: 'gymflow_dev'
    };
  }

  try {
    const parsed = new URL(url);
    return {
      dialect: 'postgresql',
      host: parsed.hostname || 'localhost',
      port: parsed.port || '5432',
      database: (parsed.pathname || '/gymflow').replace(/^\//, '') || 'gymflow',
      user: decodeURIComponent(parsed.username || 'gymflow'),
      password: decodeURIComponent(parsed.password || 'gymflow_dev')
    };
  } catch {
    return {
      dialect: 'postgresql',
      host: 'localhost',
      port: '5432',
      database: 'gymflow',
      user: 'gymflow',
      password: 'gymflow_dev'
    };
  }
}

function getDbConfig() {
  const fromDbPkg = parseEnvFile(DB_ENV_PATH).DATABASE_URL;
  const fromApi = parseEnvFile(API_ENV_PATH).DATABASE_URL;
  const parsed = parseDbUrl(fromDbPkg || fromApi || '');
  return {
    ...parsed,
    selectedEngine: 'postgresql',
    engineSupport: {
      sqlite: false,
      postgresql: true,
      mysql: false
    }
  };
}

function writeDbConfig(input) {
  const cfg = {
    host: input.host || 'localhost',
    port: input.port || '5432',
    database: input.database || 'gymflow',
    user: input.user || 'gymflow',
    password: input.password || 'gymflow_dev'
  };

  const dbUrl = `postgresql://${encodeURIComponent(cfg.user)}:${encodeURIComponent(cfg.password)}@${cfg.host}:${cfg.port}/${cfg.database}`;

  upsertEnvFile(DB_ENV_PATH, {
    DATABASE_URL: dbUrl
  });

  upsertEnvFile(API_ENV_PATH, {
    DATABASE_URL: dbUrl,
    API_PORT: parseEnvFile(API_ENV_PATH).API_PORT || '4000',
    FRONTEND_URL: parseEnvFile(API_ENV_PATH).FRONTEND_URL || 'http://localhost:3000',
    NODE_ENV: parseEnvFile(API_ENV_PATH).NODE_ENV || 'development'
  });

  upsertEnvFile(WEB_ENV_PATH, {
    NEXT_PUBLIC_API_URL: parseEnvFile(WEB_ENV_PATH).NEXT_PUBLIC_API_URL || 'http://localhost:4000'
  });

  pushLog('Config', 'Database configuration saved to apps/api/.env and packages/database/.env');
}

function spawnManaged(command, args, key, label) {
  if (processRegistry[key]) {
    pushLog('Launcher', `${label} is already running.`);
    return false;
  }

  const child = spawn(command, args, {
    cwd: ROOT_DIR,
    shell: true,
    env: process.env
  });

  processRegistry[key] = child;

  child.stdout.on('data', data => pushLog(label, data.toString()));
  child.stderr.on('data', data => pushLog(`${label} stderr`, data.toString()));

  child.on('close', code => {
    processRegistry[key] = null;
    pushLog(label, `Exited with code ${code}`);
  });

  child.on('error', err => {
    processRegistry[key] = null;
    pushLog(label, `Failed to start: ${err.message}`);
  });

  pushLog('Launcher', `${label} started.`);
  return true;
}

function stopManaged(key, label) {
  const child = processRegistry[key];
  if (!child) {
    pushLog('Launcher', `${label} is not running.`);
    return;
  }

  try {
    if (process.platform === 'win32') {
      spawn('taskkill', ['/pid', String(child.pid), '/t', '/f'], {
        cwd: ROOT_DIR,
        shell: true,
        windowsHide: true
      }).on('error', err => {
        pushLog('Launcher', `Error stopping ${label}: ${err.message}`);
      });
    } else {
      child.kill('SIGTERM');
    }
    pushLog('Launcher', `Stopping ${label}...`);
  } catch (err) {
    pushLog('Launcher', `Error stopping ${label}: ${err.message}`);
  }
}

function runCommand(command, args, label) {
  return new Promise(resolve => {
    const child = spawn(command, args, {
      cwd: ROOT_DIR,
      shell: true,
      env: process.env
    });

    child.stdout.on('data', data => pushLog(label, data.toString()));
    child.stderr.on('data', data => pushLog(`${label} stderr`, data.toString()));

    child.on('close', code => resolve(code === 0));
    child.on('error', err => {
      pushLog(label, `Failed to run: ${err.message}`);
      resolve(false);
    });
  });
}

function statusPayload() {
  return {
    prerequisites: getPrerequisitesCached(),
    running: {
      all: !!processRegistry.all,
      api: !!processRegistry.api,
      web: !!processRegistry.web
    },
    isInstalling,
    dbConfig: getDbConfig(),
    logs: activeLogs.slice(-220)
  };
}

async function handleAction(action, payload) {
  switch (action) {
    case 'install': {
      if (isInstalling) return { ok: false, message: 'Install already in progress.' };
      isInstalling = true;
      pushLog('Installer', 'Installing root dependencies with npm install...');
      const ok = await runCommand('npm', ['install'], 'npm install');
      isInstalling = false;
      return { ok, message: ok ? 'Dependencies installed.' : 'Dependency install failed.' };
    }

    case 'save:db': {
      if (payload.engine && payload.engine !== 'postgresql') {
        pushLog('Config', `${payload.engine} is shown for inspiration, but GymFlow schema currently supports postgresql only.`);
        return { ok: false, message: 'Only postgresql is currently supported in this GymFlow schema.' };
      }
      writeDbConfig(payload);
      return { ok: true, message: 'Database config saved.' };
    }

    case 'db:generate': {
      const ok = await runCommand('npm', ['run', 'db:generate'], 'db:generate');
      return { ok, message: ok ? 'db:generate completed.' : 'db:generate failed.' };
    }

    case 'db:migrate': {
      const ok = await runCommand('npm', ['run', 'db:migrate'], 'db:migrate');
      return { ok, message: ok ? 'db:migrate completed.' : 'db:migrate failed.' };
    }

    case 'db:seed': {
      const ok = await runCommand('npm', ['run', 'db:seed'], 'db:seed');
      return { ok, message: ok ? 'db:seed completed.' : 'db:seed failed.' };
    }

    case 'start:all': {
      const ok = spawnManaged('npm', ['run', 'dev'], 'all', 'Turbo Dev');
      return { ok, message: ok ? 'Turbo dev started.' : 'Turbo dev already running.' };
    }

    case 'start:api': {
      const ok = spawnManaged('npm', ['--workspace', 'apps/api', 'run', 'dev'], 'api', 'API Dev');
      return { ok, message: ok ? 'API dev started.' : 'API dev already running.' };
    }

    case 'start:web': {
      const ok = spawnManaged('npm', ['--workspace', 'apps/web', 'run', 'dev'], 'web', 'Web Dev');
      return { ok, message: ok ? 'Web dev started.' : 'Web dev already running.' };
    }

    case 'stop:all': {
      stopManaged('all', 'Turbo Dev');
      stopManaged('api', 'API Dev');
      stopManaged('web', 'Web Dev');
      return { ok: true, message: 'Stop signal sent to all services.' };
    }

    case 'stop:api': {
      stopManaged('api', 'API Dev');
      return { ok: true, message: 'API stop signal sent.' };
    }

    case 'stop:web': {
      stopManaged('web', 'Web Dev');
      return { ok: true, message: 'Web stop signal sent.' };
    }

    case 'clear:logs': {
      activeLogs = [];
      return { ok: true, message: 'Logs cleared.' };
    }

    default:
      return { ok: false, message: `Unknown action: ${action}` };
  }
}

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body)
  });
  res.end(body);
}

const PAGE = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>GymFlow Launcher Wizard</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet" />
  <style>
    :root {
      --bg:#f2f6fc;
      --panel:#fff;
      --line:#d7e1ee;
      --text:#0f172a;
      --muted:#4b5563;
      --ok:#15803d;
      --bad:#b91c1c;
      --warn:#b45309;
      --brand:#0f766e;
      --brand2:#0369a1;
      --radius:14px;
      --shadow:0 18px 50px rgba(9,30,66,.08);
    }
    *{box-sizing:border-box}
    body{margin:0;font-family:Manrope,sans-serif;color:var(--text);background:radial-gradient(circle at 0 0,#def8ff,transparent 35%),radial-gradient(circle at 100% 100%,#dcffe8,transparent 40%),var(--bg)}
    .wrap{max-width:1220px;margin:0 auto;padding:24px;display:grid;grid-template-columns:280px 1fr;gap:20px}
    .side,.card{background:var(--panel);border:1px solid var(--line);border-radius:var(--radius);box-shadow:var(--shadow)}
    .side{padding:18px;position:sticky;top:14px;height:fit-content}
    .brand{font-weight:800;letter-spacing:.06em;color:var(--brand)}
    .sub{color:var(--muted);font-size:14px;margin:8px 0 16px}
    .link{display:block;padding:10px 12px;border-radius:10px;text-decoration:none;background:#f8fafc;color:var(--text);font-weight:700;margin-bottom:8px}
    .hero{padding:24px;border-radius:var(--radius);background:linear-gradient(130deg,#064e3b,#0f766e 45%,#0369a1);color:#eaf7ff}
    .hero h1{margin:0 0 8px;font-size:30px}
    .hero p{margin:0;color:#d9edf8}
    .cards{display:grid;gap:16px}
    .card{padding:18px}
    .card h2{margin:0 0 12px;font-size:18px}
    .status{display:inline-block;padding:5px 10px;border-radius:999px;font-size:12px;font-weight:800;border:1px solid transparent;margin-right:8px}
    .status.ok{background:#ecfdf3;color:var(--ok);border-color:#bbf7d0}
    .status.bad{background:#fef2f2;color:var(--bad);border-color:#fecaca}
    .status.warn{background:#fff7ed;color:var(--warn);border-color:#fed7aa}
    .btns{display:flex;flex-wrap:wrap;gap:10px}
    button{border:0;border-radius:10px;padding:10px 14px;cursor:pointer;color:#fff;font-weight:800;background:linear-gradient(120deg,var(--brand),var(--brand2))}
    button.alt{background:#334155}
    button.warn{background:#b45309;color:#fff}
    button.bad{background:#b91c1c;color:#fff}
    button:disabled{opacity:.55;cursor:not-allowed}
    .db-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-bottom:12px}
    .db-card{border:1px solid var(--line);border-radius:12px;padding:12px;background:#f8fafc}
    .db-card.active{border:2px solid #0ea5e9;background:#ecfeff}
    .db-title{font-weight:800}
    .db-note{font-size:12px;color:var(--muted);margin-top:6px}
    .form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
    .form input{width:100%;padding:10px;border:1px solid var(--line);border-radius:10px}
    .log{max-height:340px;overflow:auto;padding:12px;border-radius:10px;border:1px solid #0f172a;background:#020617;color:#d6e3f6;font-family:"IBM Plex Mono",monospace;font-size:12px;white-space:pre-wrap}
    .hint{font-size:13px;color:var(--muted)}
    @media(max-width:980px){.wrap{grid-template-columns:1fr}.side{position:static}.db-grid,.form{grid-template-columns:1fr}}
  </style>
</head>
<body>
  <div class="wrap">
    <aside class="side">
      <div class="brand">GYMFLOW WIZARD</div>
      <p class="sub">Inspired by the premium docs launcher chapter with a 4-step setup flow.</p>
      <a class="link" href="#s1">Step 1 Prerequisites</a>
      <a class="link" href="#s2">Step 2 Database</a>
      <a class="link" href="#s3">Step 3 Install and Bootstrap</a>
      <a class="link" href="#s4">Step 4 Run and Stop</a>
      <a class="link" href="#logs">Live Console</a>
      <p class="hint">Root: ${ROOT_DIR.replace(/\\/g, '/')}</p>
    </aside>

    <main class="cards">
      <section class="hero">
        <h1>GymFlow One-Click Launcher</h1>
        <p>Guided setup wizard: environment check, database config, dependency install, then one-click startup and safe shutdown.</p>
      </section>

      <section class="card" id="s1">
        <h2>Step 1: Environment Check</h2>
        <div id="prereqRow"></div>
        <p class="hint">Step 2 and Step 3 stay available, but startup is strongly recommended only after Node and npm are OK.</p>
      </section>

      <section class="card" id="s2">
        <h2>Step 2: Database Engine and Config</h2>
        <div class="db-grid" id="engineGrid"></div>
        <div class="form">
          <input id="dbHost" placeholder="Host" />
          <input id="dbPort" placeholder="Port" />
          <input id="dbName" placeholder="Database" />
          <input id="dbUser" placeholder="User" />
          <input id="dbPass" placeholder="Password" type="password" />
          <input id="dbDialect" placeholder="Dialect" disabled />
        </div>
        <div class="btns" style="margin-top:12px">
          <button id="saveDbBtn">Save DB Config</button>
        </div>
        <p class="hint" id="dbHint"></p>
      </section>

      <section class="card" id="s3">
        <h2>Step 3: Install and Bootstrap</h2>
        <div class="btns">
          <button id="installBtn">Install Dependencies</button>
          <button class="alt" id="genBtn">Prisma Generate</button>
          <button class="alt" id="migrateBtn">DB Migrate</button>
          <button class="alt" id="seedBtn">DB Seed</button>
        </div>
      </section>

      <section class="card" id="s4">
        <h2>Step 4: Runtime Control Center</h2>
        <div id="runtimeRow" style="margin-bottom:10px"></div>
        <div class="btns">
          <button id="startAllBtn">Start Full Stack</button>
          <button class="alt" id="startApiBtn">Start API Only</button>
          <button class="alt" id="startWebBtn">Start Web Only</button>
          <button class="warn" id="stopApiBtn">Stop API</button>
          <button class="warn" id="stopWebBtn">Stop Web</button>
          <button class="bad" id="stopAllBtn">Stop Everything</button>
        </div>
      </section>

      <section class="card" id="logs">
        <h2>Live Console</h2>
        <div class="btns"><button class="alt" id="clearLogsBtn">Clear Logs</button></div>
        <div class="log" id="logBox">Waiting for launcher events...</div>
      </section>
    </main>
  </div>

  <script>
    const logBox = document.getElementById('logBox');
    const prereqRow = document.getElementById('prereqRow');
    const runtimeRow = document.getElementById('runtimeRow');
    const dbHint = document.getElementById('dbHint');
    const dbInputs = ['dbHost', 'dbPort', 'dbName', 'dbUser', 'dbPass'];
    let selectedEngine = 'postgresql';
    let inFlight = false;
    let refreshInFlight = false;
    let isEditingDbForm = false;

    function setActionButtonsDisabled(disabled) {
      document.querySelectorAll('button').forEach(btn => {
        btn.disabled = disabled;
      });
    }

    dbInputs.forEach(id => {
      const el = document.getElementById(id);
      el.addEventListener('focus', () => {
        isEditingDbForm = true;
      });
      el.addEventListener('blur', () => {
        const focused = document.activeElement;
        isEditingDbForm = focused && dbInputs.includes(focused.id);
      });
    });

    function statusPill(ok, label, goodText, badText) {
      const cls = ok ? 'ok' : 'bad';
      return '<span class="status ' + cls + '">' + label + ': ' + (ok ? goodText : badText) + '</span>';
    }

    function warnPill(label, value) {
      return '<span class="status warn">' + label + ': ' + value + '</span>';
    }

    async function invoke(action, payload = {}) {
      if (inFlight) return;
      inFlight = true;
      setActionButtonsDisabled(true);
      try {
        await fetch('/api/action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action, payload })
        });
      } finally {
        inFlight = false;
        setActionButtonsDisabled(false);
      }
      await refresh(true);
    }

    function renderEngines(dbConfig) {
      const grid = document.getElementById('engineGrid');
      const entries = [
        { key: 'sqlite', label: 'SQLite', note: dbConfig.engineSupport.sqlite ? 'Supported' : 'Not supported by current Prisma schema' },
        { key: 'postgresql', label: 'PostgreSQL', note: dbConfig.engineSupport.postgresql ? 'Supported and recommended' : 'Not supported' },
        { key: 'mysql', label: 'MySQL', note: dbConfig.engineSupport.mysql ? 'Supported' : 'Not supported by current Prisma schema' }
      ];

      grid.innerHTML = entries.map(e => {
        const active = selectedEngine === e.key ? 'active' : '';
        return '<div class="db-card ' + active + '">'
          + '<div class="db-title">' + e.label + '</div>'
          + '<div class="db-note">' + e.note + '</div>'
          + '<div style="margin-top:10px"><button ' + (dbConfig.engineSupport[e.key] ? '' : 'class="warn"') + ' data-engine="' + e.key + '" onclick="selectEngine(this.dataset.engine)">Select</button></div>'
          + '</div>';
      }).join('');
    }

    window.selectEngine = function(engine) {
      selectedEngine = engine;
      refresh();
    };

    async function refresh(forceFormSync = false) {
      if (refreshInFlight) return;
      refreshInFlight = true;
      try {
        const res = await fetch('/api/status');
        const data = await res.json();

      prereqRow.innerHTML =
        statusPill(data.prerequisites.node, 'Node', 'OK', 'Missing') +
        statusPill(data.prerequisites.npm, 'npm', 'OK', 'Missing') +
        statusPill(data.prerequisites.git, 'Git', 'OK', 'Missing') +
        warnPill('Installer', data.isInstalling ? 'Running' : 'Idle');

      runtimeRow.innerHTML =
        warnPill('Turbo Dev', data.running.all ? 'Running' : 'Stopped') +
        warnPill('API Dev', data.running.api ? 'Running' : 'Stopped') +
        warnPill('Web Dev', data.running.web ? 'Running' : 'Stopped');

      if (!['sqlite', 'postgresql', 'mysql'].includes(selectedEngine)) {
        selectedEngine = 'postgresql';
      }

      renderEngines(data.dbConfig);

      if (!isEditingDbForm || forceFormSync) {
        document.getElementById('dbHost').value = data.dbConfig.host || '';
        document.getElementById('dbPort').value = data.dbConfig.port || '';
        document.getElementById('dbName').value = data.dbConfig.database || '';
        document.getElementById('dbUser').value = data.dbConfig.user || '';
        document.getElementById('dbPass').value = data.dbConfig.password || '';
      }
      document.getElementById('dbDialect').value = selectedEngine;

      dbHint.textContent = selectedEngine === 'postgresql'
        ? 'PostgreSQL is active for GymFlow. Save will write DATABASE_URL into apps/api/.env and packages/database/.env.'
        : 'This engine is shown to match the premium launcher concept, but GymFlow schema currently supports postgresql only.';

        const rows = data.logs.map(l => '[' + l.time + '] [' + l.source + '] ' + l.message);
        logBox.textContent = rows.length ? rows.join('\\n') : 'No logs yet.';
        logBox.scrollTop = logBox.scrollHeight;
      } catch (err) {
        logBox.textContent = 'Launcher connection error: ' + err.message;
      } finally {
        refreshInFlight = false;
      }
    }

    document.getElementById('saveDbBtn').onclick = () => invoke('save:db', {
      engine: selectedEngine,
      host: document.getElementById('dbHost').value.trim(),
      port: document.getElementById('dbPort').value.trim(),
      database: document.getElementById('dbName').value.trim(),
      user: document.getElementById('dbUser').value.trim(),
      password: document.getElementById('dbPass').value.trim()
    });

    document.getElementById('installBtn').onclick = () => invoke('install');
    document.getElementById('genBtn').onclick = () => invoke('db:generate');
    document.getElementById('migrateBtn').onclick = () => invoke('db:migrate');
    document.getElementById('seedBtn').onclick = () => invoke('db:seed');

    function launchAndOpen(action, targetUrl) {
      const opened = window.open(targetUrl, '_blank', 'noopener,noreferrer');
      if (!opened) {
        window.location.href = targetUrl;
      }
      invoke(action);
    }

    document.getElementById('startAllBtn').onclick = () => launchAndOpen('start:all', 'http://localhost:3000');
    document.getElementById('startApiBtn').onclick = () => launchAndOpen('start:api', 'http://localhost:4000/api/docs');
    document.getElementById('startWebBtn').onclick = () => launchAndOpen('start:web', 'http://localhost:3000');
    document.getElementById('stopApiBtn').onclick = () => invoke('stop:api');
    document.getElementById('stopWebBtn').onclick = () => invoke('stop:web');
    document.getElementById('stopAllBtn').onclick = () => invoke('stop:all');

    document.getElementById('clearLogsBtn').onclick = () => invoke('clear:logs');

    refresh();
    setInterval(refresh, 2000);
  </script>
</body>
</html>`;

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === 'GET' && url.pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(PAGE);
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/status') {
    sendJson(res, 200, statusPayload());
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/action') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      try {
        const parsed = body ? JSON.parse(body) : {};
        const result = await handleAction(parsed.action, parsed.payload || {});
        sendJson(res, 200, result);
      } catch (err) {
        sendJson(res, 400, { ok: false, message: err.message });
      }
    });
    return;
  }

  sendJson(res, 404, { ok: false, message: 'Not found' });
});

server.listen(PORT, HOST, () => {
  pushLog('Launcher', `GymFlow launcher is running at http://${HOST}:${PORT}`);
  console.log(`GymFlow launcher is running at http://${HOST}:${PORT}`);
});

function gracefulExit() {
  stopManaged('all', 'Turbo Dev');
  stopManaged('api', 'API Dev');
  stopManaged('web', 'Web Dev');
  process.exit(0);
}

process.on('SIGINT', gracefulExit);
process.on('SIGTERM', gracefulExit);
