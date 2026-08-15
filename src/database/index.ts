import path from 'path';
import fs from 'fs';
import { config } from '../config';

/**
 * Pure JavaScript, file-based (JSON) database.
 *
 * WHY: better-sqlite3 requires native compilation (node-gyp) which fails on
 * many hosting environments without a proper build toolchain (Termux/Android
 * missing NDK, some low-resource containers, etc). This store has ZERO
 * native dependencies — it works identically on Termux, Katabump, Docker,
 * Railway, Render, Heroku, or anywhere Node.js runs.
 *
 * The public API below is intentionally identical to the previous
 * better-sqlite3-backed implementation so no command files need changes.
 */

interface Warning {
  user_id: string;
  group_id: string;
  count: number;
}

interface Filter {
  id: number;
  chat_id: string;
  type: string;
  pattern: string;
  response: string;
}

interface ApiConfigRow {
  provider: string;
  key_encrypted: string;
  base_url: string;
  model: string;
}

interface Store {
  settings: Record<string, string>;
  group_settings: Record<string, Record<string, string>>;
  chatbot_states: Record<string, boolean>;
  conversation_history: Record<string, { role: string; content: string; timestamp: number }[]>;
  sudo_users: string[];
  blocked_users: string[];
  variables: Record<string, string>;
  plugins: Record<string, { enabled: boolean; config: string | null }>;
  logs: { id: number; timestamp: number; level: string; message: string }[];
  warnings: Warning[];
  filters: Filter[];
  api_config: Record<string, ApiConfigRow>;
  feedback: { id: number; user_id: string; message: string; timestamp: number }[];
  audit_logs: { id: number; timestamp: number; action: string; user: string; details: string }[];
  _seq: Record<string, number>;
}

const MAX_LOGS = 2000;
const MAX_CONVERSATION_PER_CHAT = 200;
const MAX_FEEDBACK = 2000;
const MAX_AUDIT_LOGS = 5000;

function emptyStore(): Store {
  return {
    settings: {},
    group_settings: {},
    chatbot_states: {},
    conversation_history: {},
    sudo_users: [],
    blocked_users: [],
    variables: {},
    plugins: {},
    logs: [],
    warnings: [],
    filters: [],
    api_config: {},
    feedback: [],
    audit_logs: [],
    _seq: { logs: 0, filters: 0, feedback: 0, audit_logs: 0 },
  };
}

export class DatabaseService {
  private filePath: string;
  private store: Store;
  private saveTimer: NodeJS.Timeout | null = null;
  private dirty = false;

  constructor(dbPath?: string) {
    const target = dbPath || config.databaseUrl || path.join('data', 'hemix.json');
    // Support legacy .db path values by swapping extension to .json
    this.filePath = target.endsWith('.json') ? target : target.replace(/\.[^./]+$/, '') + '.json';
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    this.store = this.load();

    // Flush any pending writes on process exit so nothing is lost.
    process.on('exit', () => this.flush());
    process.on('SIGINT', () => { this.flush(); process.exit(0); });
    process.on('SIGTERM', () => { this.flush(); process.exit(0); });
  }

  private load(): Store {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        return { ...emptyStore(), ...parsed };
      }
    } catch {
      // Corrupted or unreadable file — fall back to a fresh store rather
      // than crashing the whole bot.
      const backupPath = `${this.filePath}.corrupted-${Date.now()}.bak`;
      try {
        if (fs.existsSync(this.filePath)) fs.copyFileSync(this.filePath, backupPath);
      } catch {
        /* ignore */
      }
    }
    return emptyStore();
  }

  /** Marks state as dirty and schedules a debounced disk write. */
  private markDirty(): void {
    this.dirty = true;
    if (this.saveTimer) return;
    this.saveTimer = setTimeout(() => {
      this.saveTimer = null;
      this.flush();
    }, 250);
  }

  private flush(): void {
    if (!this.dirty) return;
    try {
      const tmpPath = `${this.filePath}.tmp`;
      fs.writeFileSync(tmpPath, JSON.stringify(this.store));
      fs.renameSync(tmpPath, this.filePath);
      this.dirty = false;
    } catch (err) {
      // Best effort — do not crash the bot over a failed save.
      // eslint-disable-next-line no-console
      console.error('DatabaseService: failed to persist store:', (err as Error).message);
    }
  }

  private nextId(seq: keyof Store['_seq']): number {
    this.store._seq[seq] = (this.store._seq[seq] || 0) + 1;
    return this.store._seq[seq];
  }

  // Settings
  public getSetting(key: string, defaultValue: string): string;
  public getSetting(key: string, defaultValue?: string): string | null;
  public getSetting(key: string, defaultValue?: string): string | null {
    const value = this.store.settings[key];
    if (value !== undefined) return value;
    return defaultValue !== undefined ? defaultValue : null;
  }

  public setSetting(key: string, value: string): void {
    this.store.settings[key] = value;
    this.markDirty();
  }

  // Group Settings
  public getGroupSetting(groupId: string, key: string, defaultValue: string): string;
  public getGroupSetting(groupId: string, key: string, defaultValue?: string): string | null;
  public getGroupSetting(groupId: string, key: string, defaultValue?: string): string | null {
    const value = this.store.group_settings[groupId]?.[key];
    if (value !== undefined) return value;
    return defaultValue !== undefined ? defaultValue : null;
  }

  public setGroupSetting(groupId: string, key: string, value: string): void {
    if (!this.store.group_settings[groupId]) this.store.group_settings[groupId] = {};
    this.store.group_settings[groupId][key] = value;
    this.markDirty();
  }

  // Chatbot States
  public getChatbotState(chatId: string): boolean {
    return !!this.store.chatbot_states[chatId];
  }

  public setChatbotState(chatId: string, enabled: boolean): void {
    this.store.chatbot_states[chatId] = enabled;
    this.markDirty();
  }

  // Conversation History
  public addConversationMessage(chatId: string, role: string, content: string): void {
    if (!this.store.conversation_history[chatId]) this.store.conversation_history[chatId] = [];
    const list = this.store.conversation_history[chatId];
    list.push({ role, content, timestamp: Date.now() });
    if (list.length > MAX_CONVERSATION_PER_CHAT) list.splice(0, list.length - MAX_CONVERSATION_PER_CHAT);
    this.markDirty();
  }

  public getConversationHistory(chatId: string, limit: number = 20): { role: string; content: string; timestamp: number }[] {
    const list = this.store.conversation_history[chatId] || [];
    return list.slice(-limit);
  }

  public clearConversationHistory(chatId: string): void {
    delete this.store.conversation_history[chatId];
    this.markDirty();
  }

  // Sudo Users
  public isSudo(jid: string): boolean {
    return this.store.sudo_users.includes(jid);
  }

  public addSudo(jid: string): void {
    if (!this.store.sudo_users.includes(jid)) this.store.sudo_users.push(jid);
    this.markDirty();
  }

  public removeSudo(jid: string): void {
    this.store.sudo_users = this.store.sudo_users.filter((j) => j !== jid);
    this.markDirty();
  }

  public getSudos(): string[] {
    return [...this.store.sudo_users];
  }

  // Blocked Users
  public isBlocked(jid: string): boolean {
    return this.store.blocked_users.includes(jid);
  }

  public blockUser(jid: string): void {
    if (!this.store.blocked_users.includes(jid)) this.store.blocked_users.push(jid);
    this.markDirty();
  }

  public unblockUser(jid: string): void {
    this.store.blocked_users = this.store.blocked_users.filter((j) => j !== jid);
    this.markDirty();
  }

  public getBlockedUsers(): string[] {
    return [...this.store.blocked_users];
  }

  // Variables
  public getVariable(key: string): string | null {
    return this.store.variables[key] ?? null;
  }

  public setVariable(key: string, value: string): void {
    this.store.variables[key] = value;
    this.markDirty();
  }

  public deleteVariable(key: string): void {
    delete this.store.variables[key];
    this.markDirty();
  }

  // Plugins
  public getPlugin(name: string): { enabled: boolean; config: string | null } | null {
    return this.store.plugins[name] || null;
  }

  public setPlugin(name: string, enabled: boolean, pluginConfig?: string): void {
    this.store.plugins[name] = { enabled, config: pluginConfig ?? null };
    this.markDirty();
  }

  public getAllPlugins(): { name: string; enabled: boolean; config: string | null }[] {
    return Object.entries(this.store.plugins).map(([name, p]) => ({ name, enabled: p.enabled, config: p.config }));
  }

  // Logs
  public addLog(level: string, message: string): void {
    this.store.logs.push({ id: this.nextId('logs'), timestamp: Date.now(), level, message });
    if (this.store.logs.length > MAX_LOGS) this.store.logs.splice(0, this.store.logs.length - MAX_LOGS);
    this.markDirty();
  }

  public getLogs(limit: number = 50): { id: number; timestamp: number; level: string; message: string }[] {
    return this.store.logs.slice(-limit).reverse();
  }

  // Warnings
  public getWarningCount(userId: string, groupId: string): number {
    const row = this.store.warnings.find((w) => w.user_id === userId && w.group_id === groupId);
    return row ? row.count : 0;
  }

  public addWarning(userId: string, groupId: string): number {
    let row = this.store.warnings.find((w) => w.user_id === userId && w.group_id === groupId);
    if (!row) {
      row = { user_id: userId, group_id: groupId, count: 0 };
      this.store.warnings.push(row);
    }
    row.count += 1;
    this.markDirty();
    return row.count;
  }

  public resetWarnings(userId: string, groupId: string): void {
    this.store.warnings = this.store.warnings.filter((w) => !(w.user_id === userId && w.group_id === groupId));
    this.markDirty();
  }

  // Filters
  public getFilters(chatId: string): Filter[] {
    return this.store.filters.filter((f) => f.chat_id === chatId);
  }

  public addFilter(chatId: string, type: string, pattern: string, response: string): void {
    this.store.filters.push({ id: this.nextId('filters'), chat_id: chatId, type, pattern, response });
    this.markDirty();
  }

  public deleteFilter(id: number): void {
    this.store.filters = this.store.filters.filter((f) => f.id !== id);
    this.markDirty();
  }

  // API Config
  public getApiConfig(provider: string): ApiConfigRow | null {
    return this.store.api_config[provider] || null;
  }

  public setApiConfig(provider: string, keyEncrypted: string, baseUrl: string, model: string): void {
    this.store.api_config[provider] = { provider, key_encrypted: keyEncrypted, base_url: baseUrl, model };
    this.markDirty();
  }

  // Feedback
  public addFeedback(userId: string, message: string): void {
    this.store.feedback.push({ id: this.nextId('feedback'), user_id: userId, message, timestamp: Date.now() });
    if (this.store.feedback.length > MAX_FEEDBACK) this.store.feedback.splice(0, this.store.feedback.length - MAX_FEEDBACK);
    this.markDirty();
  }

  public getFeedback(limit: number = 50): { id: number; user_id: string; message: string; timestamp: number }[] {
    return this.store.feedback.slice(-limit).reverse();
  }

  // Audit Logs
  public addAuditLog(action: string, user: string, details: string): void {
    this.store.audit_logs.push({ id: this.nextId('audit_logs'), timestamp: Date.now(), action, user, details });
    if (this.store.audit_logs.length > MAX_AUDIT_LOGS) this.store.audit_logs.splice(0, this.store.audit_logs.length - MAX_AUDIT_LOGS);
    this.markDirty();
  }

  public getAuditLogs(limit: number = 50): { id: number; timestamp: number; action: string; user: string; details: string }[] {
    return this.store.audit_logs.slice(-limit).reverse();
  }

  /**
   * Limited SQL-like compatibility layer for the handful of raw queries used
   * across command files. Only the exact patterns actually used in this
   * codebase are supported — anything unrecognized returns an empty array
   * and logs a warning instead of throwing, so a stray call never crashes
   * the bot.
   */
  public query<T = any>(sql: string, params: any[] = []): T[] {
    const normalized = sql.trim().replace(/\s+/g, ' ');

    if (normalized === 'SELECT user_id, group_id, count FROM warnings') {
      return this.store.warnings.map((w) => ({ user_id: w.user_id, group_id: w.group_id, count: w.count })) as unknown as T[];
    }

    if (normalized === "SELECT group_id FROM group_settings WHERE key = 'mute' AND value = 'true'") {
      const rows: { group_id: string }[] = [];
      for (const [groupId, kv] of Object.entries(this.store.group_settings)) {
        if (kv.mute === 'true') rows.push({ group_id: groupId });
      }
      return rows as unknown as T[];
    }

    if (normalized === 'DELETE FROM settings WHERE key != "dashboard_password"') {
      const kept = this.store.settings.dashboard_password;
      this.store.settings = kept !== undefined ? { dashboard_password: kept } : {};
      this.markDirty();
      return [] as T[];
    }

    if (normalized === 'SELECT * FROM group_settings WHERE group_id = ?') {
      const groupId = params[0];
      const kv = this.store.group_settings[groupId] || {};
      return Object.entries(kv).map(([key, value]) => ({ group_id: groupId, key, value })) as unknown as T[];
    }

    // Dashboard: all settings as key-value rows
    if (normalized === 'SELECT key, value FROM settings') {
      return Object.entries(this.store.settings).map(([key, value]) => ({ key, value })) as unknown as T[];
    }

    // Dashboard: all group settings flattened
    if (normalized === 'SELECT group_id, key, value FROM group_settings') {
      const rows: { group_id: string; key: string; value: string }[] = [];
      for (const [groupId, kv] of Object.entries(this.store.group_settings)) {
        for (const [key, value] of Object.entries(kv)) {
          rows.push({ group_id: groupId, key, value: value as string });
        }
      }
      return rows as unknown as T[];
    }

    // Dashboard: anti-feature settings (keys starting with 'anti')
    if (normalized === "SELECT group_id, key, value FROM group_settings WHERE key LIKE 'anti%'") {
      const rows: { group_id: string; key: string; value: string }[] = [];
      for (const [groupId, kv] of Object.entries(this.store.group_settings)) {
        for (const [key, value] of Object.entries(kv)) {
          if (key.startsWith('anti')) {
            rows.push({ group_id: groupId, key, value: value as string });
          }
        }
      }
      return rows as unknown as T[];
    }

    // Dashboard: all variables
    if (normalized === 'SELECT key, value FROM variables') {
      return Object.entries(this.store.variables).map(([key, value]) => ({ key, value })) as unknown as T[];
    }

    // Dashboard: paginated logs — SELECT id, timestamp, level, message FROM logs ORDER BY id DESC LIMIT ? OFFSET ?
    if (normalized.startsWith('SELECT id, timestamp, level, message FROM logs ORDER BY id DESC')) {
      const limit = (params[0] as number) || 50;
      const offset = (params[1] as number) || 0;
      const sorted = [...this.store.logs].sort((a, b) => b.id - a.id);
      return sorted.slice(offset, offset + limit) as unknown as T[];
    }

    // Dashboard: log count — SELECT COUNT(*) as count FROM logs
    if (normalized === 'SELECT COUNT(*) as count FROM logs') {
      return [{ count: this.store.logs.length }] as unknown as T[];
    }

    // eslint-disable-next-line no-console
    console.error(`DatabaseService.query: unsupported query pattern: "${normalized}"`);
    return [] as T[];
  }

  public execute(_sql: string, _params: any[] = []): { changes: number } {
    // Not used for raw mutating SQL anywhere in this codebase; kept for API
    // compatibility. Use the typed methods above instead.
    // eslint-disable-next-line no-console
    console.error('DatabaseService.execute: raw SQL execution is not supported by the JSON store.');
    return { changes: 0 };
  }

  /** Forces an immediate synchronous save (e.g. before shutdown). */
  public forceSave(): void {
    this.dirty = true;
    this.flush();
  }
}

export const db = new DatabaseService();
