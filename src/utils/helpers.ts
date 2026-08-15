import fs from 'fs';
import { BotConfig } from '../config';

export function detectPlatform(): string {
  if (process.env.HEROKU_APP_NAME || process.env.HEROKU_DYNO_ID) {
    return 'Heroku';
  }
  if (process.env.RAILWAY_STATIC_URL || process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID) {
    return 'Railway';
  }
  if (process.env.RENDER || process.env.RENDER_SERVICE_ID) {
    return 'Render';
  }
  if (process.env.DOCKER_CONTAINER || fs.existsSync('/.dockerenv')) {
    return 'Docker';
  }
  return 'VPS';
}

export function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const parts: string[] = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);

  return parts.join(' ');
}

export function formatJid(numberStr: string): string {
  if (!numberStr) return '';
  let cleaned = numberStr.trim();
  if (cleaned.includes('@')) {
    return cleaned;
  }
  cleaned = cleaned.replace(/[^0-9]/g, '');
  if (!cleaned) return '';
  return `${cleaned}@s.whatsapp.net`;
}

export function isOwner(jid: string, cfg: BotConfig): boolean {
  if (!jid || !cfg || !cfg.ownerNumber) return false;
  const cleanJidDigits = jid.replace(/[^0-9]/g, '');
  const cleanOwnerDigits = cfg.ownerNumber.replace(/[^0-9]/g, '');
  if (!cleanOwnerDigits) return false;
  return cleanJidDigits === cleanOwnerDigits;
}

export function getRandomElement<T>(array: T[]): T {
  const index = Math.floor(Math.random() * array.length);
  return array[index];
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function truncate(str: string, length: number): string {
  if (!str) return '';
  if (str.length <= length) return str;
  return str.slice(0, length - 3) + '...';
}

export function parseCommand(text: string, prefix: string): {
  isCommand: boolean;
  command: string;
  args: string[];
  text: string;
} {
  if (!text || typeof text !== 'string') {
    return { isCommand: false, command: '', args: [], text: '' };
  }

  const trimmed = text.trim();
  if (!trimmed.startsWith(prefix)) {
    return { isCommand: false, command: '', args: [], text: trimmed };
  }

  const withoutPrefix = trimmed.slice(prefix.length).trim();
  const parts = withoutPrefix.split(/\s+/);
  const command = parts[0] ? parts[0].toLowerCase() : '';
  const args = parts.slice(1);
  const bodyText = args.join(' ');

  return {
    isCommand: true,
    command,
    args,
    text: bodyText,
  };
}

export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
