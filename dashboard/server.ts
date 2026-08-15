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
import { authRouter } from './routes/auth';
import { botRouter } from './routes/bot';
import { settingsRouter } from './routes/settings';
import { logsRouter } from './routes/logs';

export const app = express();

// Security headers (relaxed for dashboard usage)
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// Gzip/deflate compression — dramatically reduces response size for
// HTML/JS/CSS/JSON, making the dashboard feel much faster especially on
// slow connections (mobile, restricted hosting).
app.use(compression());

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.use(
  session({
    secret: config.sessionSecret || 'hemix-dashboard-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 },
  })
);

// Relaxed rate limit — 500 per 15 min was too tight for active dashboard use
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

app.use('/api/', apiLimiter);

app.use('/api/auth', authRouter);
app.use('/api/bot', botRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/logs', logsRouter);

const publicPath = fs.existsSync(path.join(__dirname, 'public'))
  ? path.join(__dirname, 'public')
  : path.join(process.cwd(), 'dashboard', 'public');

// Serve static files with caching headers (1 day) for better performance
app.use(express.static(publicPath, {
  maxAge: '1d',
  etag: true,
  lastModified: true,
}));

// SPA catch-all — only for non-API, non-static routes
app.get('*', (req: Request, res: Response, _next: NextFunction) => {
  if (req.path.startsWith('/api/')) {
    res.status(404).json({ error: 'API route not found' });
    return;
  }

  const hasPassword = !!db.getSetting('dashboard_password');

  if (!hasPassword && !req.path.includes('setup.html')) {
    res.redirect('/setup.html');
    return;
  }

  if (hasPassword && (req.path === '/' || req.path === '/setup.html')) {
    const token = req.headers.authorization;
    if (!token) {
      res.redirect('/login.html');
      return;
    }
  }

  // Just send index.html — express.static above already handled real files
  res.sendFile(path.join(publicPath, 'index.html'));
});

export function startDashboardServer(port?: number) {
  const listenPort = port || config.port || 3000;
  const server = app.listen(listenPort, '0.0.0.0', () => {
    console.log(`[Hemix Dashboard] Server listening on 0.0.0.0:${listenPort}`);
  });
  return server;
}

export function startDashboard(port?: number) {
  return startDashboardServer(port);
}

if (require.main === module) {
  startDashboardServer();
}

export default app;
