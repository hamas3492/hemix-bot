/**
 * Smart Dashboard URL System
 * 
 * Works on ANY platform — Katabump, Heroku, Railway, Render, VPS, Docker.
 * Detects the platform's public URL automatically. If no public URL is
 * available (e.g., Katabump), falls back to an auto-public-URL service.
 * 
 * The final dashboard URL is printed to the console on startup.
 */

import logger from './logger';

let urlInstance: any = null;

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
 */
export async function startPublicUrl(port: number): Promise<string | null> {
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

/**
 * Print the dashboard URL banner to the console.
 * This is the main entry point — called on startup.
 */
export async function printDashboardUrl(port: number): Promise<void> {
  // First try to detect a platform-provided URL
  let url = detectPublicUrl();

  if (!url) {
    // No platform URL — try auto-public-URL service
    url = await startPublicUrl(port);
  }

  if (url) {
    console.log('\n');
    console.log('\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557');
    console.log('\u2551                                                           \u2551');
    console.log('\u2551  \u{1F310} HEMIX DASHBOARD                                       \u2551');
    console.log('\u2551                                                           \u2551');
    console.log(`\u2551  ${url.padEnd(53)}\u2551`);
    console.log('\u2551                                                           \u2551');
    console.log('\u2551  Open this link in your browser to access the dashboard.  \u2551');
    console.log('\u2551  Set up password \u2192 Login \u2192 Start Bot \u2192 Connect       \u2551');
    console.log('\u2551                                                           \u2551');
    console.log('\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D');
    console.log('\n');
    logger.info(`Dashboard URL: ${url}`);
  } else {
    console.log('\n');
    console.log('\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557');
    console.log('\u2551                                                           \u2551');
    console.log('\u2551  \u{1F310} HEMIX DASHBOARD                                       \u2551');
    console.log('\u2551                                                           \u2551');
    console.log(`\u2551  http://localhost:${String(port).padEnd(39)}\u2551`);
    console.log('\u2551                                                           \u2551');
    console.log('\u2551  Open this link in your browser to access the dashboard.  \u2551');
    console.log('\u2551  Set up password \u2192 Login \u2192 Start Bot \u2192 Connect       \u2551');
    console.log('\u2551                                                           \u2551');
    console.log('\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D');
    console.log('\n');
    logger.info(`Dashboard running on http://localhost:${port}`);
    logger.info('For public access: deploy on Railway/Render/Heroku, or set ENABLE_TUNNEL=true');
  }
}

// Backward compat
export const startTunnel = startPublicUrl;
export const stopTunnel = stopPublicUrl;
