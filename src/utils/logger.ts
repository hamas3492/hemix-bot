import { EventEmitter } from 'events';
import { db } from '../database';

export class LogEventEmitter extends EventEmitter {}

export const logEventEmitter = new LogEventEmitter();

export class Logger {
  private emitter: LogEventEmitter;

  constructor(emitter: LogEventEmitter = logEventEmitter) {
    this.emitter = emitter;
  }

  private formatTime(): string {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    return `[${hh}:${mm}:${ss}]`;
  }

  private log(level: string, message: string): void {
    const timeStr = this.formatTime();
    const formattedMessage = `${timeStr} [${level.toUpperCase()}] ${message}`;
    console.log(formattedMessage);

    try {
      db.addLog(level, message);
    } catch {
      // Prevent recursion or failure if DB isn't ready
    }

    this.emitter.emit('log', {
      timestamp: Date.now(),
      formattedTime: timeStr,
      level,
      message,
    });
  }

  public info(message: string): void {
    this.log('info', message);
  }

  public warn(message: string): void {
    this.log('warn', message);
  }

  public error(message: string, error?: any): void {
    const errDetails = error ? (error.stack || error.message || String(error)) : '';
    const fullMsg = errDetails ? `${message} - ${errDetails}` : message;
    this.log('error', fullMsg);
  }

  public debug(message: string): void {
    this.log('debug', message);
  }

  public command(commandName: string, user: string, responseTimeMs?: number): void {
    const duration = responseTimeMs !== undefined ? ` (${responseTimeMs}ms)` : '';
    this.log('command', `Executed '${commandName}' by ${user}${duration}`);
  }

  public getEmitter(): LogEventEmitter {
    return this.emitter;
  }
}

export const logger = new Logger();
export default logger;
