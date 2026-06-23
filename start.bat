@echo off
title GymFlow Dev
setlocal

set "ROOT=%~dp0"
set "API_DIR=%ROOT%apps\api"
set "WEB_DIR=%ROOT%apps\web"
set "DB_SCHEMA=%ROOT%packages\database\prisma\schema.prisma"
set "PG_SERVICE=postgresql-x64-15"
set "DB_NAME=gymflow"
set "DB_USER=gymflow"
set "DB_PASS=gymflow_dev"
set "PG_SUPERUSER=postgres"
set "PGPASSWORD=admin"

echo ============================================
echo  GymFlow Dev Launcher
echo ============================================
echo.

:: ── 1. Start PostgreSQL ───────────────────────────────────────────────────
echo [Step 1/7] Checking PostgreSQL service (%PG_SERVICE%)...
sc query "%PG_SERVICE%" | find "RUNNING" >nul 2>&1
if errorlevel 1 (
    echo   Starting PostgreSQL...
    net start "%PG_SERVICE%"
    if errorlevel 1 (
        echo   WARNING: Could not start %PG_SERVICE% - the API may fail to connect.
        echo   Make sure PostgreSQL is installed and run this script as Administrator if needed.
        echo.
    ) else (
        echo   PostgreSQL started.
        timeout /t 2 /nobreak >nul
    )
) else (
    echo   PostgreSQL is already running.
)
echo.

:: ── 2. Create DB user and database if missing ─────────────────────────────
echo [Step 2/7] Checking database...
psql -U %PG_SUPERUSER% -d postgres -c "" >nul 2>&1
if errorlevel 1 (
    echo   WARNING: Cannot connect to PostgreSQL as %PG_SUPERUSER% - skipping DB setup.
    echo   If this is the first run, make sure the postgres superuser password is 'admin'.
) else (
    :: Create role if it does not exist
    psql -U %PG_SUPERUSER% -d postgres -c "DO $$ BEGIN IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '%DB_USER%') THEN CREATE USER %DB_USER% WITH PASSWORD '%DB_PASS%'; END IF; END $$;" >nul 2>&1

    :: Create database if it does not exist
    psql -U %PG_SUPERUSER% -d postgres -tc "SELECT 1 FROM pg_database WHERE datname = '%DB_NAME%'" | find "1" >nul 2>&1
    if errorlevel 1 (
        echo   Creating database '%DB_NAME%'...
        psql -U %PG_SUPERUSER% -d postgres -c "CREATE DATABASE %DB_NAME% OWNER %DB_USER%;"
        psql -U %PG_SUPERUSER% -d postgres -c "GRANT ALL PRIVILEGES ON DATABASE %DB_NAME% TO %DB_USER%;"
        echo   Database created.
    ) else (
        echo   Database '%DB_NAME%' already exists.
    )
)
echo.

:: ── 3. Install root dependencies ─────────────────────────────────────────
echo [Step 3/7] Checking root dependencies...
if not exist "%ROOT%node_modules" (
    echo   Installing...
    cd /d "%ROOT%"
    call npm install
    if errorlevel 1 ( echo ERROR: root npm install failed & goto :error )
    echo   Done.
) else (
    echo   Already installed.
)
echo.

:: ── 4. Install API dependencies ───────────────────────────────────────────
echo [Step 4/7] Checking API dependencies...
if not exist "%API_DIR%\node_modules" (
    echo   Installing...
    cd /d "%API_DIR%"
    call npm install
    if errorlevel 1 ( echo ERROR: API npm install failed & goto :error )
    echo   Done.
) else (
    echo   Already installed.
)
echo.

:: ── 5. Install Web dependencies ───────────────────────────────────────────
echo [Step 5/7] Checking Web dependencies...
if not exist "%WEB_DIR%\node_modules" (
    echo   Installing...
    cd /d "%WEB_DIR%"
    call npm install
    if errorlevel 1 ( echo ERROR: Web npm install failed & goto :error )
    echo   Done.
) else (
    echo   Already installed.
)
echo.

:: ── 6. Generate Prisma client + run migrations ────────────────────────────
echo [Step 6/7] Prisma generate + migrate...
cd /d "%ROOT%"
call npx prisma generate --schema="%DB_SCHEMA%"
if errorlevel 1 ( echo ERROR: Prisma generate failed & goto :error )
cd /d "%ROOT%\packages\database"
call npx prisma migrate deploy
if errorlevel 1 (
    echo   migrate deploy failed - trying db push as fallback...
    call npx prisma db push --schema="%DB_SCHEMA%" --accept-data-loss
    if errorlevel 1 ( echo ERROR: Prisma db push also failed & goto :error )
)
echo   Done.
echo.

:: ── 7. Rebuild native addons (bcrypt etc.) ────────────────────────────────
echo [Step 7/7] Rebuilding native addons (bcrypt)...
cd /d "%ROOT%"
call npm rebuild bcrypt
if errorlevel 1 ( echo WARNING: npm rebuild bcrypt failed - API may crash on start. )
echo   Done.
echo.

:: ── Launch servers ────────────────────────────────────────────────────────
echo Launching servers...
start "GymFlow API  (port 4000)" /d "%API_DIR%" cmd /k node "%ROOT%node_modules\@nestjs\cli\bin\nest.js" start --watch
timeout /t 5 /nobreak >nul
start "GymFlow Web  (port 3000)" /d "%WEB_DIR%" cmd /k node "%ROOT%node_modules\next\dist\bin\next" dev -p 3000

echo.
echo ============================================
echo  Servers are starting up
echo ============================================
echo  Frontend : http://localhost:3000
echo  Backend  : http://localhost:4000/api/v1
echo  Swagger  : http://localhost:4000/api/docs
echo ============================================
echo.
echo  Credentials:
echo    Gym Owner    : owner@demogym.com  /  Owner@1234
echo    Receptionist : reception@demogym.com  /  Reception@1234
echo    Trainer      : trainer@demogym.com  /  Trainer@1234
echo    Member       : member@demogym.com  /  Member@1234
echo.
echo  Close the server windows to stop the servers.
echo.
pause
exit /b 0

:error
echo.
pause
exit /b 1
