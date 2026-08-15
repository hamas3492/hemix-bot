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

export type ConnectionState =
  | 'WAITING'
  | 'CONNECTING'
  | 'CONNECTED'
  | 'DISCONNECTED'
  | 'RECONNECTING'
  | 'AUTH_FAILED';

export class BotClient extends EventEmitter {
  public sock: WASocket | null = null;
  public state: ConnectionState = 'WAITING';
  public phoneNumber: string | null = null;
  public userName: string | null = null;

  private qrCode: string | null = null;
  private sessionDir: string;
  private isConnecting: boolean = false;

  private currentBackoffDelay: number = 3000;
  private readonly MIN_BACKOFF_DELAY: number = 3000;
  private readonly MAX_BACKOFF_DELAY: number = 60000;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.sessionDir = path.join('data', 'session');
    this.ensureSessionDir();
  }

  private ensureSessionDir(): void {
    if (!fs.existsSync(this.sessionDir)) {
      fs.mkdirSync(this.sessionDir, { recursive: true });
    }
  }

  private deleteSessionDir(): void {
    try {
      if (fs.existsSync(this.sessionDir)) {
        fs.rmSync(this.sessionDir, { recursive: true, force: true });
        logger.info(`Session directory deleted at ${this.sessionDir}`);
      }
    } catch (err) {
      logger.error(`Failed to delete session directory at ${this.sessionDir}`, err);
    }
  }

  private clearReconnectTimeout(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  private cleanupSocket(): void {
    this.clearReconnectTimeout();

    if (this.sock) {
      try {
        this.sock.ev.removeAllListeners('creds.update');
        this.sock.ev.removeAllListeners('connection.update');
        this.sock.ev.removeAllListeners('messages.upsert');
        this.sock.end(undefined);
      } catch (err) {
        logger.error('Error ending socket connection during cleanup', err);
      }
      this.sock = null;
    }

    this.qrCode = null;
    this.phoneNumber = null;
    this.userName = null;
  }

  private scheduleReconnect(): void {
    this.clearReconnectTimeout();
    this.state = 'RECONNECTING';
    this.emit('connection_update', { state: this.state });

    const delaySeconds = Math.round(this.currentBackoffDelay / 1000);
    logger.warn(`Scheduling reconnection in ${delaySeconds}s (backoff delay)...`);

    const nextDelay = this.currentBackoffDelay;
    this.currentBackoffDelay = Math.min(this.currentBackoffDelay * 2, this.MAX_BACKOFF_DELAY);

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      this.connect().catch((err) => {
        logger.error('Error during automatic reconnection attempt:', err);
      });
    }, nextDelay);
  }

  public async connect(): Promise<void> {
    if (this.isConnecting) {
      logger.warn('Connection attempt already in progress. Guarding against duplicate connect() call.');
      return;
    }

    if (this.state === 'CONNECTED' && this.sock) {
      logger.info('BotClient is already connected.');
      return;
    }

    this.isConnecting = true;
    this.clearReconnectTimeout();

    try {
      this.ensureSessionDir();

      const credsFilePath = path.join(this.sessionDir, 'creds.json');
      if (fs.existsSync(credsFilePath)) {
        logger.info('Session credentials found (creds.json). Restoring WhatsApp session...');
      } else {
        logger.info('No session credentials found. Starting fresh authentication session...');
      }

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
          logger.info('QR Code generated/refreshed. Scan with WhatsApp.');
          this.emit('qr', qr);
          this.emit('connection_update', { state: this.state, qr });
        }

        if (connection === 'connecting') {
          this.state = 'CONNECTING';
          this.emit('connection_update', { state: this.state });
        } else if (connection === 'open') {
          this.state = 'CONNECTED';
          this.qrCode = null;
          this.currentBackoffDelay = this.MIN_BACKOFF_DELAY;

          const userJid = this.sock?.user?.id;
          this.phoneNumber = userJid ? userJid.split(':')[0].split('@')[0] : null;
          this.userName = this.sock?.user?.name || this.sock?.user?.notify || config.botName || 'Hemix';

          logger.info(`WhatsApp connection established successfully! Logged in as: ${this.userName} (${this.phoneNumber || 'unknown'})`);
          this.emit('connection_update', { state: this.state, user: this.getUserInfo() });

          await this.sendConnectedMessage();
        } else if (connection === 'close') {
          const error = lastDisconnect?.error as any;
          const statusCode = error?.output?.statusCode || error?.code || error?.status;
          const errorMessage = error?.message || (error ? String(error) : 'Unknown error');

          logger.error(`Connection closed. Status code: ${statusCode ?? 'Unknown'}, Reason: ${errorMessage}`, error);

          const isLoggedOut = statusCode === DisconnectReason.loggedOut;

          if (isLoggedOut) {
            this.state = 'AUTH_FAILED';
            logger.error('Logged out from WhatsApp session. Deleting session directory...');
            this.cleanupSocket();
            this.deleteSessionDir();
            this.emit('connection_update', { state: this.state });
          } else {
            this.cleanupSocket();
            this.scheduleReconnect();
          }
        }
      });

      this.sock.ev.on('messages.upsert', (data) => {
        this.emit('message_received', data);
      });
    } catch (error) {
      logger.error('Failed to connect BotClient:', error);
      this.state = 'DISCONNECTED';
      this.emit('connection_update', { state: this.state, error });
    } finally {
      this.isConnecting = false;
    }
  }

  private async sendConnectedMessage(): Promise<void> {
    if (!this.sock) return;

    try {
      const name = this.userName || this.sock.user?.name || config.botName || 'Hemix';
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
    this.cleanupSocket();
    this.state = 'DISCONNECTED';
    this.emit('connection_update', { state: this.state });
    logger.info('BotClient disconnected.');
  }

  public async reconnect(): Promise<void> {
    this.currentBackoffDelay = this.MIN_BACKOFF_DELAY;
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

  public getState(): ConnectionState {
    return this.state;
  }

  public getPhoneNumber(): string | null {
    return this.phoneNumber;
  }

  public getUserInfo(): { phoneNumber: string | null; userName: string | null; id: string | null } {
    return {
      phoneNumber: this.phoneNumber,
      userName: this.userName,
      id: this.sock?.user?.id || null,
    };
  }
}

export const botClient = new BotClient();
export default botClient;
