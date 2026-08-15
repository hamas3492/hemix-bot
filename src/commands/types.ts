import { BotConfig } from '../config';
import { DatabaseService } from '../database';

export interface CommandContext {
  client: any;
  message: any;
  sender: string;
  senderName: string;
  args: string[];
  jid: string;
  isGroup: boolean;
  groupMetadata?: any;
  command: string;
  text: string;
  quoted?: any;
  reply: (text: string | { text: string }, options?: any) => Promise<any>;
  replyMedia: (buf: Buffer, mime: string, caption?: string) => Promise<any>;
  config: BotConfig;
  db: DatabaseService;
}

export interface Command {
  name: string;
  alias?: string[];
  category: string;
  description: string;
  usage?: string;
  permission?: number;
  cooldown?: number;
  handler: (ctx: CommandContext) => Promise<any>;
}
