import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  WASocket,
  makeCacheableSignalKeyStore,
  fetchLatestBaileysVersion,
  AnyMessageContent,
} from '@whiskeysockets/baileys';
import pino from 'pino';
import { EventEmitter } from 'events';
import path from 'path';
import fs from 'fs';
import { config } from '../config';
import logger from '../utils/logger';
import { detectPlatform, formatJid } from '../utils/helpers';

export type ConnectionState = 'WAITING' | 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING';

export class BotClient extends EventEmitter {
  public sock: WASocket | null = null;
  public state: ConnectionState = 'WAITING';
  private qrCode: string | null = null;
  private sessionDir: string;

  constructor() {
    super();
    this.sessionDir = path.join('data', 'session');
    if (!fs.existsSync(this.sessionDir)) {
      fs.mkdirSync(this.sessionDir, { recursive: true });
    }
  }

  public async connect(): Promise<void> {
    try {
      this.state = 'CONNECTING';
      this.emit('connection_update', { state: this.state });
      logger.info('Initializing WhatsApp connection...');

      const { state, saveCreds } = await useMultiFileAuthState(this.sessionDir);
      const { version } = await fetchLatestBaileysVersion();

      const silentLogger = pino({ level: 'silent' });

      this.sock = makeWASocket({
        version,
        logger: silentLogger as any,
        printQRInTerminal: true,
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(state.keys, silentLogger as any),
        },
        generateHighQualityLinkPreview: true,
      });

      this.sock.ev.on('creds.update', saveCreds);

      this.sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          this.qrCode = qr;
          this.state = 'WAITING';
          logger.info('QR Code generated. Scan to log in.');
          this.emit('qr', qr);
          this.emit('connection_update', { state: this.state, qr });
        }

        if (connection === 'connecting') {
          this.state = 'CONNECTING';
          this.emit('connection_update', { state: this.state });
        } else if (connection === 'open') {
          this.state = 'CONNECTED';
          this.qrCode = null;
          logger.info('WhatsApp connection established successfully!');
          this.emit('connection_update', { state: this.state });

          await this.sendConnectedMessage();
        } else if (connection === 'close') {
          const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
          const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

          logger.warn(`Connection closed. Status code: ${statusCode}. Reconnecting: ${shouldReconnect}`);

          if (shouldReconnect) {
            this.state = 'RECONNECTING';
            this.emit('connection_update', { state: this.state });
            setTimeout(() => this.connect(), 3000);
          } else {
            this.state = 'DISCONNECTED';
            this.emit('connection_update', { state: this.state });
            logger.error('Logged out from WhatsApp session. Please delete data/session and re-scan QR.');
          }
        }
      });

      this.sock.ev.on('messages.upsert', (data) => {
        this.emit('message_received', data);
      });
    } catch (error) {
      logger.error('Failed to connect BotClient', error);
      this.state = 'DISCONNECTED';
      this.emit('connection_update', { state: this.state, error });
    }
  }

  private async sendConnectedMessage(): Promise<void> {
    if (!this.sock) return;

    try {
      const name = this.sock.user?.name || config.botName || 'Hemix';
      const platform = detectPlatform();
      const modeFormatted = config.botMode === 'public' ? 'Public' : 'Private';

      const connectedMessage = `┏━━─『 HEMIX 』─━━
┃ » Username: ${name}
┃ » Platform: ${platform}
┃ » Prefix: [ ${config.botPrefix} ]
┃ » Mode: ${modeFormatted}
┃ » Version: [ ${config.version} ]
┗━━━━━━━━━━━━━···`;

      const targetJid = this.sock.user?.id
        ? formatJid(this.sock.user.id)
        : config.ownerNumber
        ? formatJid(config.ownerNumber)
        : null;

      if (targetJid) {
        await this.sendMessage(targetJid, { text: connectedMessage });
        logger.info(`Sent connection notification to ${targetJid}`);
      }
    } catch (err) {
      logger.error('Failed to send connected message', err);
    }
  }

  public async disconnect(): Promise<void> {
    if (this.sock) {
      try {
        await this.sock.end(undefined);
      } catch (err) {
        logger.error('Error disconnecting socket', err);
      }
      this.sock = null;
    }
    this.state = 'DISCONNECTED';
    this.emit('connection_update', { state: this.state });
  }

  public async reconnect(): Promise<void> {
    await this.disconnect();
    await this.connect();
  }

  public async sendMessage(jid: string, content: string | AnyMessageContent): Promise<any> {
    if (!this.sock) {
      throw new Error('BotClient is not connected');
    }
    const targetJid = formatJid(jid);
    if (typeof content === 'string') {
      return await this.sock.sendMessage(targetJid, { text: content });
    }
    return await this.sock.sendMessage(targetJid, content);
  }

  public getQR(): string | null {
    return this.qrCode;
  }

  public async getPairingCode(phoneNumber: string): Promise<string> {
    if (!this.sock) {
      throw new Error('BotClient is not initialized yet. Call connect() first.');
    }
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
    const code = await this.sock.requestPairingCode(cleanNumber);
    logger.info(`Generated pairing code for ${cleanNumber}: ${code}`);
    this.emit('pairing_code', code);
    return code;
  }
}

export const botClient = new BotClient();
export default botClient;
