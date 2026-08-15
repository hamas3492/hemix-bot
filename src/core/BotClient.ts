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
  private pairingInProgress: boolean = false;
  private pairingRetries: number = 0;
  private readonly MAX_PAIRING_RETRIES: number = 5;

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
    this.pairingInProgress = false;
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

  private resetPairingFlag(): void {
    if (this.pairingInProgress) {
      this.pairingInProgress = false;
      logger.info('Pairing flow ended.');
    }
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

      // Attach creds.save listener BEFORE requesting the pairing code.
      // The pairing code generates credentials that must be persisted
      // immediately — if we attach the listener afterwards, a fast
      // connection close (status 428) can fire before creds are saved,
      // and the reconnect finds no session ("No session found"),
      // wasting the pairing code.
      this.sock.ev.on('creds.update', saveCreds);

      // Request the pairing code as early as possible — but the
      // WebSocket must be OPEN first, otherwise Baileys throws
      // "Connection Closed". We wait for that, then request the code
      // immediately, before the QR-linking path starts.
      let pairingCode: string | undefined;
      if (pairPhoneNumber && !state.creds.registered) {
        const cleanNumber = pairPhoneNumber.replace(/[^0-9]/g, '');
        try {
          await (this.sock as any).waitForSocketOpen();
          pairingCode = await this.sock.requestPairingCode(cleanNumber);
          this.pairingInProgress = true;
          this.pairingRetries = 0;
          logger.info(`Pairing code generated for ${cleanNumber}: ${pairingCode}`);
          this.emit('pairing_code', pairingCode);
        } catch (err) {
          logger.error('Failed to request pairing code', err);
          this.isConnecting = false;
          throw err;
        }
      }

      this.sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        // Suppress QR during a pairing-code flow — WhatsApp generating
        // a QR on reconnect would invalidate the pending pairing code
        // and cause "Couldn't link device".
        if (qr && !pairPhoneNumber && !this.pairingInProgress) {
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
          this.pairingInProgress = false;
          this.pairingRetries = 0;
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

          if (this.pairingInProgress && statusCode !== undefined && statusCode !== null) {
            this.pairingRetries++;
            if (this.pairingRetries > this.MAX_PAIRING_RETRIES) {
              // Too many reconnects during pairing — the user likely
              // didn't enter the code in time or WhatsApp rejected it.
              // Stop the pairing flow and clean up.
              logger.error(`Pairing flow: max retries (${this.MAX_PAIRING_RETRIES}) exceeded. Aborting.`);
              this.pairingInProgress = false;
              this.pairingRetries = 0;
              this.state = 'AUTH_FAILED';
              this.cleanupSocket();
              this.deleteSessionDir();
              this.emit('connection_update', { state: this.state });
            } else {
              // During a pairing-code flow, WhatsApp closes the socket
              // after issuing the code (428/515/408/401). Reconnect
              // WITHOUT a new pairing code. The reconnected socket
              // reuses the same creds and waits for the user to enter
              // the code on their phone, at which point WhatsApp sends
              // connection: 'open'. Suppress QR (invalidates pairing)
              // and don't delete session on 401 (destroys partial creds).
              logger.info(`Pairing flow: connection closed (status ${statusCode}). Reconnect ${this.pairingRetries}/${this.MAX_PAIRING_RETRIES}...`);
              this.cleanupSocket();
              this.connect().catch((err) => logger.error('Error reconnecting in pairing flow:', err));
            }
          } else if (isLoggedOut) {
            this.state = 'AUTH_FAILED';
            logger.error('Logged out from WhatsApp. Deleting session...');
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
    this.pairingInProgress = false;
    this.pairingRetries = 0;
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
