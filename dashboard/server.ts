import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import session from 'express-session';
import compression from 'compression';
import { config } from '../src/config';
import { db } from '../src/database';
import { botClient } from '../src/core/BotClient';
import { authRouter } from './routes/auth';
import { botRouter } from './routes/bot';
import { settingsRouter } from './routes/settings';
import { logsRouter } from './routes/logs';

export const app = express();

// ─── Security Headers ─────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// ─── Compression ───────────────────────────────────────────────────
app.use(compression());

// ─── CORS ──────────────────────────────────────────────────────────
// Production: use CORS_ORIGINS env var. Fallback: same-origin only.
const corsOptions: cors.CorsOptions = {
  origin: config.corsOrigins.length > 0 ? config.corsOrigins : true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// ─── Body Parsing ─────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ─── Session ──────────────────────────────────────────────────────
app.use(
  session({
    secret: config.sessionSecret || 'hemix-dashboard-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: config.nodeEnv === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: 'lax' as const,
    },
  })
);

// ─── Rate Limiting ─────────────────────────────────────────────────
// Sensitive endpoints: stricter limit
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // 20 per 15 min for auth endpoints
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Please try again later.' },
});

// General API: relaxed for active dashboard use
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);

// ─── Routes ────────────────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/bot', botRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/logs', logsRouter);

// ─── Health Check Endpoint ────────────────────────────────────────
app.get('/health', (_req: Request, res: Response) => {
  const memUsage = process.memoryUsage();
  res.json({
    status: 'ok',
    uptime: Math.floor(process.uptime()),
    botState: botClient.state,
    memory: {
      rss: Math.round(memUsage.rss / (1024 * 1024)),
      heapUsed: Math.round(memUsage.heapUsed / (1024 * 1024)),
    },
    timestamp: new Date().toISOString(),
  });
});

// ─── SSE: Real-time Bot Status Stream ──────────────────────────────
app.get('/api/bot/status-stream', (req: Request, res: Response) => {
  // Auth check via token query param (SSE can't use headers easily)
  const token = req.query.token as string;
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  // Send current state immediately
  const sendStatus = () => {
    const payload = JSON.stringify({
      state: botClient.state,
      uptime: Math.floor(process.uptime()),
      user: botClient.sock?.user || null,
      phoneNumber: botClient.getPhoneNumber?.() || null,
      hasQR: !!botClient.getQR(),
      timestamp: Date.now(),
    });
    res.write(`data: ${payload}\n\n`);
  };

  sendStatus();

  // Listen for connection updates
  const onUpdate = () => sendStatus();
  botClient.on('connection_update', onUpdate);

  // Heartbeat every 30s to keep connection alive
  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 30000);

  // Cleanup on close
  req.on('close', () => {
    botClient.removeListener('connection_update', onUpdate);
    clearInterval(heartbeat);
  });
});

// ─── Static Files ─────────────────────────────────────────────────
const publicPath = fs.existsSync(path.join(__dirname, 'public'))
  ? path.join(__dirname, 'public')
  : path.join(process.cwd(), 'dashboard', 'public');

app.use(express.static(publicPath, {
  maxAge: '1d',
  etag: true,
  lastModified: true,
}));

// ─── SPA Catch-all ─────────────────────────────────────────────────
app.get('*', (req: Request, res: Response, _next: NextFunction) => {
  if (req.path.startsWith('/api/')) {
    res.status(404).json({ error: 'API route not found' });
    return;
  }

  // Never expose .env or session files
  if (req.path.includes('.env') || req.path.includes('data/session')) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  const hasPassword = !!db.getSetting('dashboard_password');

  if (!hasPassword && !req.path.includes('setup.html')) {
    res.redirect('/setup.html');
    return;
  }

  if (hasPassword && (req.path === '/' || req.path === '/setup.html')) {
    res.redirect('/login.html');
    return;
  }

  res.sendFile(path.join(publicPath, 'index.html'));
});

// ─── Centralized Error Handler ─────────────────────────────────────
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Server Error]', err.message);
  res.status(500).json({
    error: config.nodeEnv === 'production' ? 'Internal server error' : err.message,
  });
});

// ─── Start Server ──────────────────────────────────────────────────
export function startDashboardServer(port?: number) {
  const listenPort = port || config.port || 3000;
  const server = app.listen(listenPort, '0.0.0.0', () => {
    console.log(`[Hemix Dashboard] Server listening on port ${listenPort}`);
    if (config.dashboardUrl) {
      console.log(`[Hemix Dashboard] Production URL: ${config.dashboardUrl}`);
    }
  });

  // Graceful shutdown
  const shutdown = () => {
    console.log('[Hemix Dashboard] Shutting down gracefully...');
    server.close();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  return server;
}

export function startDashboard(port?: number) {
  return startDashboardServer(port);
}

if (require.main === module) {
  startDashboardServer();
}

export default app;
