import { config } from './config';
import { db } from './database';
import logger from './utils/logger';
import { botClient } from './core/BotClient';
import { commandRegistry } from './core/PluginSystem';
import { messageHandler } from './handlers/MessageHandler';
import { eventHandler } from './handlers/EventHandler';
import { startDashboardServer } from '../dashboard/server';
import { systemService } from './services/SystemService';
import fs from 'fs';
import path from 'path';

async function bootstrap() {
  logger.info(`Starting ${config.botName} V${config.version}...`);
  logger.info(`Environment: ${config.nodeEnv}`);
  logger.info('Database initialized successfully.');

  // Load all commands from src/commands/
  commandRegistry.loadAllCommands();

  // Attach message handler
  botClient.on('message_received', (data) => {
    if (botClient.sock) {
      messageHandler.handleUpsert(botClient.sock, data);
    }
  });

  // Attach event handler on connection
  botClient.on('connection_update', ({ state }) => {
    if (state === 'CONNECTED' && botClient.sock) {
      eventHandler.registerEvents(botClient.sock);
      logger.info('Event handlers registered.');
    }
  });

  // Start web dashboard only — bot connection is initiated from the dashboard
  startDashboardServer();

  // If a saved WhatsApp session exists, auto-reconnect so the bot comes back online
  // after a server restart. If no session exists, user must connect from the dashboard.
  const sessionDir = path.join(process.cwd(), 'data', 'session');
  const credsFile = path.join(sessionDir, 'creds.json');

  if (fs.existsSync(credsFile)) {
    logger.info('Existing WhatsApp session found. Auto-reconnecting...');
    botClient.connect().catch((err) => {
      logger.error('Auto-reconnect failed. Start the bot from the dashboard.', err);
    });
  } else {
    logger.info('No WhatsApp session found. Connect from the dashboard at the website URL.');
    logger.info('Dashboard → WhatsApp Link tab → click "Start Bot" → scan QR or use pairing code.');
  }
}

// Global Exception Handlers (log don't crash)
process.on('uncaughtException', (error) => {
  logger.error(`Uncaught Exception: ${error.message}`);
});

process.on('unhandledRejection', (reason) => {
  logger.error(`Unhandled Rejection: ${reason}`);
});

// Graceful Shutdown
const shutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  try {
    await botClient.disconnect();
    logger.info('Bot disconnected successfully.');
    process.exit(0);
  } catch (err) {
    logger.error(`Error during shutdown: ${(err as Error).message}`);
    process.exit(1);
  }
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

bootstrap().catch((err) => {
  logger.error(`Failed to start: ${err.message}`);
  process.exit(1);
});
