import { config } from './config';
import { db } from './database';
import logger from './utils/logger';
import { botClient } from './core/BotClient';
import { commandRegistry } from './core/PluginSystem';
import { messageHandler } from './handlers/MessageHandler';
import { eventHandler } from './handlers/EventHandler';
import { startDashboardServer } from '../dashboard/server';
import { startTunnel } from './utils/tunnel';
import { systemService } from './services/SystemService';

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

  // Start web dashboard
  startDashboardServer();

  // Auto-start tunnel for public dashboard access (Katabump doesn't expose web ports)
  // Tunnel is enabled by default. Set ENABLE_TUNNEL=false in .env to disable.
  if (process.env.ENABLE_TUNNEL !== 'false') {
    const tunnelPort = config.port;
    // Small delay to ensure server is ready
    setTimeout(() => {
      startTunnel(tunnelPort).catch((err) => {
        logger.warn(`Failed to start tunnel: ${err}`);
      });
    }, 3000);
  }

  // Connect to WhatsApp
  await botClient.connect();
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
