import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export interface BotConfig {
  port: number;
  sessionSecret: string;
  databaseUrl: string;
  aiApiKey: string;
  aiBaseUrl: string;
  aiModel: string;
  ownerNumber: string;
  botPrefix: string;
  botMode: 'public' | 'private';
  botName: string;
  ownerName: string;
  version: string;
  footer: string;
  menuStyle: string | number;
  timezone: string;
}

export const config: BotConfig = {
  port: parseInt(process.env.PORT || '3000', 10),
  sessionSecret: process.env.SESSION_SECRET || 'hemix-session-secret-key',
  databaseUrl: process.env.DATABASE_URL || path.join('data', 'hemix.db'),
  aiApiKey: process.env.AI_API_KEY || process.env.OPENAI_API_KEY || '',
  aiBaseUrl: process.env.AI_BASE_URL || 'https://api.openai.com/v1',
  aiModel: process.env.AI_MODEL || 'gpt-3.5-turbo',
  ownerNumber: process.env.OWNER_NUMBER || '',
  botPrefix: process.env.BOT_PREFIX || '.',
  botMode: (process.env.BOT_MODE as 'public' | 'private') || 'private',
  botName: process.env.BOT_NAME || 'Hemix',
  ownerName: process.env.OWNER_NAME || 'Owner',
  version: process.env.VERSION || '1.0.0',
  footer: process.env.FOOTER || 'Powered by Hemix Bot V1.0',
  menuStyle: process.env.MENU_STYLE || '1',
  timezone: process.env.TIMEZONE || 'Asia/Karachi',
};

export default config;
