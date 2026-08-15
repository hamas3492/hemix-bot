/**
 * Auto-Tunnel Module
 * 
 * On Katabump (and similar Pterodactyl panels), web ports are not exposed.
 * This module automatically creates a public URL for the dashboard using localtunnel.
 * 
 * The URL is printed to console — visible in Katabump's "Console" tab.
 */

import logger from './logger';

let tunnelInstance: any = null;

export async function startTunnel(port: number): Promise<string | null> {
  try {
    // Dynamic require — localtunnel is installed on the production server
    // @ts-ignore
    const localtunnel = require('localtunnel');
    
    tunnelInstance = await localtunnel({ 
      port,
      subdomain: process.env.TUNNEL_SUBDOMAIN || undefined 
    });
    
    const url = tunnelInstance.url;
    logger.info(`╔══════════════════════════════════════════════╗`);
    logger.info(`║  🌐 DASHBOARD PUBLIC URL: ${url}`);
    logger.info(`║  Open this link from any device, anywhere!`);
    logger.info(`╚══════════════════════════════════════════════╝`);
    
    // Auto-reconnect if tunnel closes
    tunnelInstance.on('close', () => {
      logger.warn('Tunnel closed. Attempting to reconnect...');
      setTimeout(() => startTunnel(port), 5000);
    });
    
    tunnelInstance.on('error', (err: any) => {
      logger.error('Tunnel error:', err);
    });
    
    return url;
  } catch (err: any) {
    logger.warn(`Tunnel not available: ${err.message}`);
    logger.info('Dashboard accessible only within the container.');
    logger.info('Set up a tunnel manually or use WhatsApp commands to control the bot.');
    return null;
  }
}

export function stopTunnel(): void {
  if (tunnelInstance) {
    try {
      tunnelInstance.close();
    } catch (e) {
      // ignore
    }
    tunnelInstance = null;
  }
}
