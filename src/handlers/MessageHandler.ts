import { WASocket, proto } from '@whiskeysockets/baileys';
import { config } from '../config';
import { db } from '../database';
import logger from '../utils/logger';
import { parseCommand } from '../utils/helpers';
import { checkPermission, PermissionLevel } from '../utils/permissions';
import { commandRegistry } from '../core/PluginSystem';
import { aiService } from '../services/AIService';
import { CommandContext } from '../commands/types';

export class MessageHandler {
  private userCooldowns: Map<string, Map<string, number>> = new Map();

  public async handleMessage(sock: WASocket, msg: proto.IWebMessageInfo): Promise<void> {
    if (!msg.message || !msg.key) return;

    const jid = msg.key.remoteJid || '';
    if (!jid || jid === 'status@broadcast') return;

    // Extract text content from message
    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      msg.message.imageMessage?.caption ||
      msg.message.videoMessage?.caption ||
      '';

    if (!text || !text.trim()) return;

    const isGroup = jid.endsWith('@g.us');

    // When the owner sends a message from their OWN linked number — e.g.
    // typing commands into "Message yourself" — Baileys marks it
    // `fromMe: true` (self-bot messages always look this way, since the
    // bot IS the owner's account). Resolve `sender` to the bot's own JID
    // in that case so owner permission checks + cooldowns work correctly,
    // instead of blanket-ignoring every fromMe message like before.
    const sender = msg.key.fromMe
      ? (sock.user?.id ? sock.user.id.split(':')[0] + '@s.whatsapp.net' : jid)
      : msg.key.participant || msg.key.remoteJid || '';

    const senderName = msg.key.fromMe
      ? (sock.user?.name || sock.user?.notify || 'You')
      : msg.pushName || sender.split('@')[0] || 'User';
    const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage
      ? { message: msg.message.extendedTextMessage.contextInfo.quotedMessage, key: msg.message.extendedTextMessage.contextInfo.stanzaId ? { id: msg.message.extendedTextMessage.contextInfo.stanzaId, remoteJid: jid } : null }
      : null;

    // Ignore blocked users
    if (db.isBlocked(sender)) {
      return;
    }

    // Parse command with configured prefix
    const parsed = parseCommand(text, config.botPrefix);

    if (parsed.isCommand) {
      const cmdObj = commandRegistry.getCommand(parsed.command);

      if (!cmdObj) return;

      // Cooldown check
      const now = Date.now();
      if (!this.userCooldowns.has(sender)) {
        this.userCooldowns.set(sender, new Map());
      }
      const userCmds = this.userCooldowns.get(sender)!;
      const lastExec = userCmds.get(parsed.command) || 0;
      const cooldownMs = (cmdObj.cooldown || 3) * 1000;

      if (now - lastExec < cooldownMs) {
        const remaining = Math.ceil((cooldownMs - (now - lastExec)) / 1000);
        await sock.sendMessage(jid, { text: `⏱ Please wait ${remaining}s before using this command again.` });
        return;
      }
      userCmds.set(parsed.command, now);

      // Permission check
      const permLevel = cmdObj.permission ?? PermissionLevel.USER;
      const allowed = checkPermission(sender, permLevel, { isGroup, db });
      if (!allowed) {
        await sock.sendMessage(jid, { text: '❌ You do not have permission to use this command.' });
        return;
      }

      // Get group metadata if in group
      let groupMetadata: any = null;
      if (isGroup) {
        try {
          groupMetadata = await sock.groupMetadata(jid);
        } catch {
          groupMetadata = null;
        }
      }

      // Build context
      const ctx: CommandContext = {
        client: sock,
        message: msg,
        sender,
        senderName,
        args: parsed.args,
        jid,
        isGroup,
        groupMetadata,
        command: parsed.command,
        text: parsed.text,
        quoted,
        reply: async (replyText: string | { text: string }, options?: any) => {
          const content = typeof replyText === 'string' ? { text: replyText, ...options } : { ...replyText, ...options };
          return await sock.sendMessage(jid, content, { quoted: msg });
        },
        replyMedia: async (buf: Buffer, mime: string, caption?: string) => {
          if (mime.startsWith('image')) {
            return await sock.sendMessage(jid, { image: buf, caption }, { quoted: msg });
          } else if (mime.startsWith('video')) {
            return await sock.sendMessage(jid, { video: buf, caption }, { quoted: msg });
          } else if (mime.startsWith('audio')) {
            return await sock.sendMessage(jid, { audio: buf, mimetype: mime }, { quoted: msg });
          } else {
            return await sock.sendMessage(jid, { document: buf, mimetype: mime, caption }, { quoted: msg });
          }
        },
        config,
        db,
      };

      const start = Date.now();
      try {
        await commandRegistry.execute(parsed.command, ctx);
        const responseTime = Date.now() - start;
        logger.command(parsed.command, sender, responseTime);
      } catch (err) {
        logger.error(`Error executing command '${parsed.command}': ${(err as Error).message}`);
      }
      return;
    }

    // Chatbot auto-reply if enabled for this chat. Skip for fromMe
    // messages — the owner typing plain text to themselves shouldn't
    // trigger the AI (and it prevents any accidental self-reply loop).
    const isChatbotEnabled = !msg.key.fromMe && db.getChatbotState(jid);
    if (isChatbotEnabled) {
      try {
        const response = await aiService.respond(jid, text);
        if (response) {
          await sock.sendMessage(jid, { text: response }, { quoted: msg });
        }
      } catch (err) {
        logger.error(`Chatbot auto-reply error in ${jid}: ${(err as Error).message}`);
      }
    }
  }

  public handleUpsert(sock: WASocket, upsert: { messages: proto.IWebMessageInfo[]; type: string }): void {
    if (upsert.type !== 'notify' && upsert.type !== 'append') return;

    for (const msg of upsert.messages) {
      this.handleMessage(sock, msg).catch(err => {
        logger.error(`Error handling message: ${(err as Error).message}`);
      });
    }
  }
}

export const messageHandler = new MessageHandler();
export default messageHandler;
