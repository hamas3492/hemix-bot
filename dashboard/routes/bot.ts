import { Router, Request, Response } from 'express';
import os from 'os';
import path from 'path';
import fs from 'fs';
import QRCode from 'qrcode';
import { authMiddleware } from './auth';
import { botClient } from '../../src/core/BotClient';
import { config } from '../../src/config';
import { detectPlatform } from '../../src/utils/helpers';
import { db } from '../../src/database';

export const botRouter = Router();

// Apply auth middleware to all bot routes
botRouter.use(authMiddleware);

// GET /api/bot/status - connection status, uptime, platform, phone number
botRouter.get('/status', (req: Request, res: Response) => {
  try {
    const phone = botClient.getPhoneNumber?.() || null;
    res.json({
      state: botClient.state,
      uptime: Math.floor(process.uptime()),
      platform: detectPlatform(),
      user: botClient.sock?.user || null,
      phoneNumber: phone,
      hasQR: !!botClient.getQR(),
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to get bot status' });
  }
});

// POST /api/bot/start - start bot
botRouter.post('/start', async (req: Request, res: Response) => {
  try {
    if (botClient.state === 'CONNECTED' || botClient.state === 'CONNECTING') {
      res.json({ success: true, message: `Bot is already ${botClient.state.toLowerCase()}`, state: botClient.state });
      return;
    }
    botClient.connect().catch((err) => {
      console.error('[Bot] Error starting bot in background:', err);
    });
    res.json({ success: true, message: 'Bot startup initiated', state: 'CONNECTING' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to start bot' });
  }
});

// POST /api/bot/stop - stop bot
botRouter.post('/stop', async (req: Request, res: Response) => {
  try {
    await botClient.disconnect();
    res.json({ success: true, message: 'Bot stopped successfully', state: 'DISCONNECTED' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to stop bot' });
  }
});

// POST /api/bot/restart - restart bot
botRouter.post('/restart', async (req: Request, res: Response) => {
  try {
    await botClient.reconnect();
    res.json({ success: true, message: 'Bot restarting...', state: botClient.state });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to restart bot' });
  }
});

// GET /api/bot/qr - get current QR code
botRouter.get('/qr', async (req: Request, res: Response) => {
  try {
    const rawQr = botClient.getQR();
    if (!rawQr) {
      res.json({ qr: null, raw: null, message: 'No active QR code. Start the bot to generate one.' });
      return;
    }
    const dataUrl = await QRCode.toDataURL(rawQr);
    res.json({ qr: dataUrl, raw: rawQr });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to generate QR code image' });
  }
});

// POST /api/bot/pair - request pairing code
botRouter.post('/pair', async (req: Request, res: Response) => {
  try {
    const { number } = req.body;
    if (!number || typeof number !== 'string') {
      res.status(400).json({ error: 'Phone number is required' });
      return;
    }

    const cleanNumber = number.replace(/[^0-9]/g, '');
    if (cleanNumber.length < 5) {
      res.status(400).json({ error: 'Invalid phone number format' });
      return;
    }

    if (botClient.state === 'CONNECTED') {
      res.status(400).json({ error: 'Already connected. Logout first to link a different device.' });
      return;
    }

    // Always start pairing from a clean slate. Any existing/partial socket
    // or stale session is torn down first — mixing an in-progress QR
    // handshake or leftover partial creds with a new pairing-code request
    // is exactly what causes WhatsApp to show "Couldn't link device".
    await botClient.disconnect();
    botClient.clearSession();

    const code = await botClient.connect(cleanNumber);
    if (!code) {
      res.status(500).json({ error: 'Failed to generate pairing code. Please try again.' });
      return;
    }

    res.json({ success: true, code, number: cleanNumber });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to generate pairing code' });
  }
});

// POST /api/bot/disconnect - disconnect WhatsApp
botRouter.post('/disconnect', async (req: Request, res: Response) => {
  try {
    await botClient.disconnect();
    res.json({ success: true, message: 'Disconnected from WhatsApp' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to disconnect' });
  }
});

// POST /api/bot/logout - logout WhatsApp session (clears session files)
botRouter.post('/logout', async (req: Request, res: Response) => {
  try {
    await botClient.disconnect();
    const sessionDir = path.join(process.cwd(), 'data', 'session');
    if (fs.existsSync(sessionDir)) {
      fs.rmSync(sessionDir, { recursive: true, force: true });
      fs.mkdirSync(sessionDir, { recursive: true });
    }
    res.json({ success: true, message: 'Logged out and session cleared' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to logout session' });
  }
});

// Helper to count command files — CACHED to avoid filesystem walk on every poll.
let _cachedCommandCount: number | null = null;
function getCommandCount(): number {
  if (_cachedCommandCount !== null) return _cachedCommandCount;
  try {
    const commandsDir = path.join(process.cwd(), 'src', 'commands');
    if (!fs.existsSync(commandsDir)) { _cachedCommandCount = 0; return 0; }
    
    let count = 0;
    function walkDir(dir: string) {
      const files = fs.readdirSync(dir, { withFileTypes: true });
      for (const file of files) {
        if (file.isDirectory()) {
          walkDir(path.join(dir, file.name));
        } else if (file.name.endsWith('.ts') || file.name.endsWith('.js')) {
          if (file.name !== 'types.ts' && file.name !== 'index.ts') {
            count++;
          }
        }
      }
    }
    walkDir(commandsDir);
    _cachedCommandCount = count;
    return count;
  } catch {
    _cachedCommandCount = 0;
    return 0;
  }
}

// GET /api/bot/system - CPU, RAM, storage, Node version, bot version, loaded plugins, command count
botRouter.get('/system', (req: Request, res: Response) => {
  try {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memoryPercentage = Math.round((usedMem / totalMem) * 100);

    const cpus = os.cpus();
    const cpuModel = cpus.length > 0 ? cpus[0].model : 'Unknown';
    const cpuCores = cpus.length;
    const loadAvg = os.loadavg();

    const plugins = db.getAllPlugins();
    const commandCount = getCommandCount();

    // Lightweight response — only essential fields
    res.json({
      cpu: {
        model: cpuModel,
        cores: cpuCores,
        loadAvg: loadAvg,
        usage: Math.min(100, Math.round((loadAvg[0] / (cpuCores || 1)) * 100)),
      },
      ram: {
        total: Math.round(totalMem / (1024 * 1024)),
        used: Math.round(usedMem / (1024 * 1024)),
        free: Math.round(freeMem / (1024 * 1024)),
        percentage: memoryPercentage,
      },
      processMemory: {
        rss: Math.round(process.memoryUsage().rss / (1024 * 1024)),
        heapUsed: Math.round(process.memoryUsage().heapUsed / (1024 * 1024)),
      },
      nodeVersion: process.version,
      botVersion: config.version,
      platform: detectPlatform(),
      osType: os.type(),
      osRelease: os.release(),
      uptime: Math.floor(process.uptime()),
      loadedPlugins: plugins,
      commandCount,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch system info' });
  }
});

export default botRouter;
