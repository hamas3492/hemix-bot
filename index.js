/**
 * Hemix Bot V1.0 — Root Entry Point (CommonJS)
 *
 * Single entry point for all hosting panels (Katabump, Heroku, Railway,
 * Render, Docker, VPS, etc).
 *
 * ── AUTO-UPDATE ──────────────────────────────────────────────────────
 * On every restart, automatically pulls the latest code from GitHub.
 * No more manually re-uploading files after every change.
 * Disable with AUTO_UPDATE=false in your .env.
 *
 * ── NO BUILD STEP NEEDED ─────────────────────────────────────────────
 * Runs TypeScript directly via ts-node (transpile-only, no type-checking).
 * This avoids the memory-heavy `tsc` full-project compile that gets
 * OOM-killed (exit code 137) on low-memory containers like Katabump.
 * If a pre-built dist/ exists (e.g. from a Docker build), that is used
 * instead for maximum performance.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = __dirname;

function log(msg) {
  console.log(`[Hemix Bot] ${msg}`);
}

function runGit(cmd) {
  return execSync(cmd, { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'] }).toString().trim();
}

/**
 * Auto-update: pulls the latest code from GitHub on every restart.
 * Safe — data/, .env, node_modules/ and dist/ are all gitignored,
 * so session data and secrets are never touched.
 */
function autoUpdate() {
  if (process.env.AUTO_UPDATE === 'false') {
    log('Auto-update disabled (AUTO_UPDATE=false).');
    return { updated: false };
  }

  const gitDir = path.join(ROOT, '.git');
  if (!fs.existsSync(gitDir)) {
    log('Not a git repository — skipping auto-update.');
    return { updated: false };
  }

  try {
    log('Checking for updates...');
    runGit('git fetch origin --quiet');

    let branch;
    try {
      branch = runGit('git symbolic-ref --short refs/remotes/origin/HEAD').replace('origin/', '');
    } catch {
      branch = 'main';
    }

    const localHash = runGit('git rev-parse HEAD');
    const remoteHash = runGit(`git rev-parse origin/${branch}`);

    if (localHash === remoteHash) {
      log('Already up to date.');
      return { updated: false };
    }

    log(`Update found. Pulling latest changes from origin/${branch}...`);

    // Snapshot package-lock.json to detect dependency changes after pull
    const lockPath = path.join(ROOT, 'package-lock.json');
    const beforeLock = fs.existsSync(lockPath) ? fs.readFileSync(lockPath, 'utf-8') : null;

    runGit(`git reset --hard origin/${branch}`);
    log('Update applied successfully.');

    const afterLock = fs.existsSync(lockPath) ? fs.readFileSync(lockPath, 'utf-8') : null;
    const depsChanged = beforeLock !== afterLock;

    return { updated: true, depsChanged };
  } catch (err) {
    console.error('[Hemix Bot] Auto-update failed (continuing with current code):', err.message);
    return { updated: false, error: err };
  }
}

/**
 * Reinstall dependencies only if package-lock.json actually changed
 * after an update. Keeps restarts fast when nothing changed.
 */
function reinstallIfNeeded(depsChanged) {
  if (!depsChanged) return;
  try {
    log('Dependencies changed. Running npm install (production)...');
    execSync('npm install --omit=dev --no-audit --no-fund', {
      cwd: ROOT,
      stdio: 'inherit',
    });
    log('Dependencies installed successfully.');
  } catch (err) {
    console.error('[Hemix Bot] npm install failed:', err.message);
    console.error('[Hemix Bot] Continuing with existing node_modules...');
  }
}

function start() {
  const compiledEntry = path.join(ROOT, 'dist', 'src', 'app.js');

  if (fs.existsSync(compiledEntry)) {
    // Pre-built dist exists (e.g. Docker build) — use it, it's fastest.
    log('Using pre-built dist/ (compiled).');
    require(compiledEntry);
    return;
  }

  // No dist/ — run TypeScript directly via ts-node, transpile-only mode.
  // This skips full-project type-checking entirely, so memory usage stays
  // low even on 512MB-1GB containers. No build step required.
  log('Running via ts-node (transpile-only, no build step needed)...');
  require('ts-node').register({
    transpileOnly: true,
    compilerOptions: {
      module: 'commonjs',
    },
  });
  require(path.join(ROOT, 'src', 'app.ts'));
}

const result = autoUpdate();
reinstallIfNeeded(result.depsChanged);
start();
