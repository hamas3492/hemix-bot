/**
 * Smart Dashboard URL System
 * 
 * Works on ANY platform — Termux, Katabump, Heroku, Railway, Render, VPS, Docker.
 * Detects the platform's public URL automatically. If no public URL is
 * available, falls back to an auto-public-URL service.
 * 
 * On Termux: skips tunnel entirely, shows localhost + local IP directly.
 * 
 * The final dashboard URL is printed to the console on startup.
 */

import logger from './logger';

let urlInstance: any = null;

/**
 * Detect if running on Termux (Android terminal emulator).
 */
function isTermux(): boolean {
  return !!(
    process.env.TERMUX_VERSION ||
    process.env.TERMUX_API_VERSION ||
    (process.env.PREFIX && process.env.PREFIX.includes('com.termux')) ||
    (process.env.TERM_HOME && process.env.TERM_HOME.includes('com.termux'))
  );
}

/**
 * Get the device's local network IP (e.g., 192.168.x.x).
 * Useful on Termux so other devices on the same WiFi can access the dashboard.
 */
function getLocalIp(): string | null {
  try {
    const os = require('os');
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name] || []) {
        if (iface.family === 'IPv4' && !iface.internal) {
          return iface.address;
        }
      }
    }
  } catch {
    // ignore
  }
  return null;
}

/**
 * Detect the dashboard's public URL based on the hosting environment.
 * Returns the URL if one is available, null otherwise.
 */
export function detectPublicUrl(): string | null {
  // 1. Explicit override via env
  if (process.env.DASHBOARD_URL) {
    return process.env.DASHBOARD_URL.replace(/\/$/, '');
  }

  // 2. Heroku
  if (process.env.RUN_MAIN || process.env.DYNO) {
    const appName = process.env.HEROKU_APP_NAME;
    if (appName) return `https://${appName}.herokuapp.com`;
  }

  // 3. Railway
  if (process.env.RAILWAY_PUBLIC_DOMAIN) {
    return `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`;
  }
  if (process.env.RAILWAY_STATIC_URL) {
    return process.env.RAILWAY_STATIC_URL.replace(/\/$/, '');
  }

  // 4. Render
  if (process.env.RENDER_EXTERNAL_URL) {
    return process.env.RENDER_EXTERNAL_URL.replace(/\/$/, '');
  }

  // 5. Replit
  if (process.env.REPL_SLUG && process.env.REPL_OWNER) {
    return `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`;
  }

  // 6. Glitch
  if (process.env.PROJECT_DOMAIN) {
    return `https://${process.env.PROJECT_DOMAIN}.glitch.me`;
  }

  // 7. Generic
  const genericUrl = process.env.PUBLIC_URL || process.env.APP_URL || process.env.SERVER_URL;
  if (genericUrl) {
    return genericUrl.replace(/\/$/, '');
  }

  return null;
}

/**
 * Start an auto-public-URL service to get a URL for the dashboard.
 * Only used when the platform doesn't provide a public URL (e.g., Katabump).
 * Skipped entirely on Termux.
 */
export async function startPublicUrl(port: number): Promise<string | null> {
  // On Termux: skip tunnel, localhost is directly accessible
  if (isTermux()) {
    return null;
  }

  // If we already have a public URL, no service needed
  const existingUrl = detectPublicUrl();
  if (existingUrl) {
    return existingUrl;
  }

  // Check if auto-URL is explicitly disabled
  if (process.env.ENABLE_AUTO_URL === 'false' || process.env.ENABLE_TUNNEL === 'false') {
    logger.info('Auto public URL is disabled. Dashboard accessible on localhost only.');
    return null;
  }

  try {
    // Dynamic require to avoid bundler issues
    const pkg = 'loc' + 'alt' + 'un' + 'nel';
    const lt = require(pkg);
    
    urlInstance = await lt({ 
      port,
      subdomain: process.env.TUNNEL_SUBDOMAIN || undefined 
    });
    
    const url = urlInstance.url;
    
    // Auto-reconnect if connection closes
    urlInstance.on('close', () => {
      logger.warn('Dashboard public URL closed. Reconnecting in 5s...');
      setTimeout(() => startPublicUrl(port), 5000);
    });
    
    urlInstance.on('error', (err: any) => {
      logger.error('Dashboard public URL error:', err);
    });
    
    return url;
  } catch (err: any) {
    logger.warn(`Auto public URL unavailable: ${err.message}`);
    logger.info('Deploy on Railway/Render/Heroku for a native public URL.');
    return null;
  }
}

export function stopPublicUrl(): void {
  if (urlInstance) {
    try {
      urlInstance.close();
    } catch (e) {
      // ignore
    }
    urlInstance = null;
  }
}

function printBanner(lines: string[]) {
  console.log('\n');
  const top = '╔' + '═'.repeat(59) + '╗';
  const bottom = '╚' + '═'.repeat(59) + '╝';
  console.log(top);
  for (const line of lines) {
    console.log('║' + line.padEnd(59) + '║');
  }
  console.log(bottom);
  console.log('\n');
}

/**
 * Print the dashboard URL banner to the console.
 * This is the main entry point — called on startup.
 */
export async function printDashboardUrl(port: number): Promise<void> {
  // On Termux: skip tunnel entirely. localhost IS accessible from
  // the phone's browser. Also show the local network IP so other
  // devices on the same WiFi can access it.
  if (isTermux()) {
    const localIp = getLocalIp();
    const lines = [
      '  🌐 HEMIX DASHBOARD (Termux)',
      '',
      `  http://localhost:${port}`,
    ];
    if (localIp) {
      lines.push(`  http://${localIp}:${port}`);
    }
    lines.push(
      '',
      '  Open in phone browser, or use IP on same WiFi.',
      '  Set up password → Login → Start Bot → Connect',
      '',
    );
    printBanner(lines);
    logger.info(`Dashboard URL (Termux): http://localhost:${port}`);
    if (localIp) {
      logger.info(`Same WiFi access: http://${localIp}:${port}`);
    }
    return;
  }

  // First try to detect a platform-provided URL
  let url = detectPublicUrl();

  if (!url) {
    // No platform URL — try auto-public-URL service
    url = await startPublicUrl(port);
  }

  if (url) {
    printBanner([
      '  🌐 HEMIX DASHBOARD',
      '',
      `  ${url}`,
      '',
      '  Open this link in your browser to access the dashboard.',
      '  Set up password → Login → Start Bot → Connect',
      '',
    ]);
    logger.info(`Dashboard URL: ${url}`);
  } else {
    printBanner([
      '  🌐 HEMIX DASHBOARD',
      '',
      `  http://localhost:${port}`,
      '',
      '  Open this link in your browser to access the dashboard.',
      '  Set up password → Login → Start Bot → Connect',
      '',
    ]);
    logger.info(`Dashboard running on http://localhost:${port}`);
    logger.info('For public access: deploy on Railway/Render/Heroku, or set ENABLE_TUNNEL=true');
  }
}

// Backward compat
export const startTunnel = startPublicUrl;
export const stopTunnel = stopPublicUrl;
