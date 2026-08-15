import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../../src/database';
import { logEventEmitter } from '../../src/utils/logger';
import { config } from '../../src/config';

export const logsRouter = Router();

const JWT_SECRET = config.sessionSecret || 'hemix-dashboard-jwt-secret';

// Permissive auth for logs stream supporting token query param
function logsAuthMiddleware(req: Request, res: Response, next: NextFunction): void {
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.query.token && typeof req.query.token === 'string') {
    token = req.query.token;
  }

  if (!token) {
    res.status(401).json({ error: 'Unauthorized: Missing token' });
    return;
  }

  try {
    jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
    return;
  }
}

logsRouter.use(logsAuthMiddleware);

// GET /api/logs - recent logs (paginated)
logsRouter.get('/', (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const page = parseInt(req.query.page as string) || 1;
    const offset = (page - 1) * limit;

    const logs = db.query(
      'SELECT id, timestamp, level, message FROM logs ORDER BY id DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );

    const totalCountRow = db.query<{ count: number }>('SELECT COUNT(*) as count FROM logs');
    const total = totalCountRow[0]?.count || 0;

    res.json({
      success: true,
      logs: logs.reverse(), // chronologically ordered for log viewer
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch logs' });
  }
});

// GET /api/logs/stream - SSE stream for real-time logs
logsRouter.get('/stream', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  // Send initial connection event
  res.write(`data: ${JSON.stringify({ type: 'connected', message: 'SSE Log Stream connected' })}\n\n`);

  // Listener function
  const onLog = (logData: any) => {
    res.write(`data: ${JSON.stringify({ type: 'log', data: logData })}\n\n`);
  };

  logEventEmitter.on('log', onLog);

  // Heartbeat every 20 seconds to keep connection alive
  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 20000);

  req.on('close', () => {
    logEventEmitter.off('log', onLog);
    clearInterval(heartbeat);
  });
});

export default logsRouter;
