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

  /**
   * Public wipe of the session directory. Used before starting a fresh
   * pairing-code link so stale/partial creds from a previous failed
   * attempt never interfere with a new one.
   */
  public clearSession(): void {
    this.deleteSessionDir();
    this.ensureSessionDir();
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

  /**
   * Connect to WhatsApp. If `pairPhoneNumber` is provided, the pairing
   * code is requested IMMEDIATELY after the socket is created — before
   * any QR code has a chance to be generated — which avoids the QR vs
   * pairing-code race condition that caused "Couldn't link device"
   * errors. Returns the pairing code when one was requested.
   */
  public async connect(pairPhoneNumber?: string): Promise<string | void> {
    if (this.isConnecting) {
      logger.warn('Connection attempt already in progress.');
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
        logger.info('Session credentials found. Restoring WhatsApp session...');
      } else {
        logger.info('No session found. Starting fresh authentication...');
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
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(state.keys, silentLogger as any),
        },
        generateHighQualityLinkPreview: true,
      });

      // Request the pairing code as early as possible — before any QR is
      // generated or event listeners attached — but the underlying
      // WebSocket must actually be OPEN first, otherwise Baileys throws
      // "Connection Closed" (it can't send the pairing IQ over a socket
      // that hasn't finished connecting yet). We wait for that here,
      // then request the code immediately, before the QR-linking path
      // has a chance to start — waiting longer (e.g. a fixed 2s delay)
      // is what caused WhatsApp to show "Couldn't link device" before.
      let pairingCode: string | undefined;
      if (pairPhoneNumber && !state.creds.registered) {
        const cleanNumber = pairPhoneNumber.replace(/[^0-9]/g, '');
        try {
          await (this.sock as any).waitForSocketOpen();
          pairingCode = await this.sock.requestPairingCode(cleanNumber);
          logger.info(`Pairing code generated for ${cleanNumber}: ${pairingCode}`);
          this.emit('pairing_code', pairingCode);
        } catch (err) {
          logger.error('Failed to request pairing code', err);
          this.isConnecting = false;
          throw err;
        }
      }

      this.sock.ev.on('creds.update', saveCreds);

      this.sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        // Only surface the QR code when we are NOT in the middle of a
        // pairing-code link — showing/using both at once is what causes
        // WhatsApp to reject the pairing code as invalid.
        if (qr && !pairPhoneNumber) {
          this.qrCode = qr;
          this.state = 'WAITING';
          logger.info('QR Code generated. Available in the dashboard — scan from there.');
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

          logger.info(`WhatsApp connected! Logged in as: ${this.userName} (${this.phoneNumber || 'unknown'})`);
          this.emit('connection_update', { state: this.state, user: this.getUserInfo() });

          await this.sendConnectedMessage();
        } else if (connection === 'close') {
          const error = lastDisconnect?.error as any;
          const statusCode = error?.output?.statusCode || error?.code || error?.status;
          const errorMessage = error?.message || (error ? String(error) : 'Unknown error');

          logger.error(`Connection closed. Status: ${statusCode ?? 'Unknown'}, Reason: ${errorMessage}`);

          const isLoggedOut = statusCode === DisconnectReason.loggedOut;

          if (isLoggedOut) {
            this.state = 'AUTH_FAILED';
            logger.error('Logged out from WhatsApp. Deleting session...');
            this.cleanupSocket();
            this.deleteSessionDir();
            this.emit('connection_update', { state: this.state });
          } else if (pairPhoneNumber && statusCode === DisconnectReason.restartRequired) {
            // Expected mid-pairing restart — Baileys requires a fresh
            // socket right after a pairing code is issued. Reconnect
            // once WITHOUT a new pairing code (the phone already has it).
            logger.info('Restart required after pairing code issuance — reconnecting...');
            this.cleanupSocket();
            this.connect().catch((err) => logger.error('Error reconnecting after pairing restart:', err));
          } else {
            this.cleanupSocket();
            this.scheduleReconnect();
          }
        }
      });

      this.sock.ev.on('messages.upsert', (data) => {
        this.emit('message_received', data);
      });

      return pairingCode;
    } catch (error) {
      logger.error('Failed to connect BotClient:', error);
      this.state = 'DISCONNECTED';
      this.emit('connection_update', { state: this.state, error });
      throw error;
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
