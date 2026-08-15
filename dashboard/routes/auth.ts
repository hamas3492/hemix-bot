import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../../src/database';
import { config } from '../../src/config';

export const authRouter = Router();

const JWT_SECRET = config.sessionSecret || 'hemix-dashboard-jwt-secret';

export interface AuthenticatedRequest extends Request {
  user?: any;
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Missing or invalid token', code: 'UNAUTHORIZED' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Unauthorized: Invalid or expired token', code: 'UNAUTHORIZED' });
    return;
  }
}

// POST /api/auth/setup - set initial password
authRouter.post('/setup', (req: Request, res: Response) => {
  const { password } = req.body;

  if (!password || typeof password !== 'string' || password.trim().length < 4) {
    res.status(400).json({ error: 'Password must be at least 4 characters long' });
    return;
  }

  const existingPassword = db.getSetting('dashboard_password');
  if (existingPassword) {
    res.status(400).json({ error: 'Setup is already complete' });
    return;
  }

  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);

  db.setSetting('dashboard_password', hashedPassword);

  const token = jwt.sign({ role: 'admin', setup: true }, JWT_SECRET, { expiresIn: '7d' });

  res.json({
    success: true,
    token,
    message: 'Initial dashboard password created successfully',
  });
});

// POST /api/auth/login - login with password
authRouter.post('/login', (req: Request, res: Response) => {
  const { password } = req.body;

  const savedHash = db.getSetting('dashboard_password');
  if (!savedHash) {
    res.status(400).json({ error: 'Dashboard setup not completed yet', setup_required: true });
    return;
  }

  if (!password || typeof password !== 'string') {
    res.status(400).json({ error: 'Password is required' });
    return;
  }

  const isValid = bcrypt.compareSync(password, savedHash);
  if (!isValid) {
    res.status(401).json({ error: 'Incorrect password' });
    return;
  }

  const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });

  res.json({
    success: true,
    token,
    message: 'Logged in successfully',
  });
});

// POST /api/auth/change-password - change password
authRouter.post('/change-password', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400).json({ error: 'Both currentPassword and newPassword are required' });
    return;
  }

  if (typeof newPassword !== 'string' || newPassword.trim().length < 4) {
    res.status(400).json({ error: 'New password must be at least 4 characters long' });
    return;
  }

  const savedHash = db.getSetting('dashboard_password');
  if (!savedHash || !bcrypt.compareSync(currentPassword, savedHash)) {
    res.status(400).json({ error: 'Incorrect current password' });
    return;
  }

  const newHash = bcrypt.hashSync(newPassword, 10);
  db.setSetting('dashboard_password', newHash);

  res.json({
    success: true,
    message: 'Password changed successfully',
  });
});

// GET /api/auth/status - check status
authRouter.get('/status', (req: Request, res: Response) => {
  const savedHash = db.getSetting('dashboard_password');
  const setup_complete = !!savedHash;

  let logged_in = false;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      jwt.verify(token, JWT_SECRET);
      logged_in = true;
    } catch {
      logged_in = false;
    }
  }

  res.json({
    setup_complete,
    logged_in,
  });
});

export default authRouter;
