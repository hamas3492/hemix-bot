import { WASocket, proto } from '@whiskeysockets/baileys';
import NodeCache from 'node-cache';
import { db } from '../database';
import logger from '../utils/logger';
import { formatJid } from '../utils/helpers';

export interface GroupParticipantUpdate {
  id: string;
  participants: string[];
  action: 'add' | 'remove' | 'promote' | 'demote' | 'modify' | string;
  author?: string;
}

export interface CallUpdate {
  id: string;
  from: string;
  status: 'offer' | 'ringing' | 'reject' | 'accept' | 'timeout' | 'terminate' | string;
  isVideo?: boolean;
  isGroup?: boolean;
}

export class EventHandler {
  private messageCache: NodeCache;

  constructor() {
    // Anti-delete cache: max 500 messages, 30 minutes (1800s) TTL
    this.messageCache = new NodeCache({
      stdTTL: 1800,
      maxKeys: 500,
      checkperiod: 120,
    });
  }

  public cacheMessage(msg: proto.IWebMessageInfo): void {
    if (msg?.key?.id) {
      this.messageCache.set(msg.key.id, msg);
    }
  }

  public registerEvents(sock: WASocket): void {
    sock.ev.on('messages.upsert', (data) => {
      if (data?.messages) {
        for (const msg of data.messages) {
          this.cacheMessage(msg);
        }
      }
    });

    sock.ev.on('group-participants.update', async (event: any) => {
      try {
        await this.handleGroupParticipantsUpdate(sock, event);
      } catch (err) {
        logger.error('Error in group-participants.update handler', err);
      }
    });

    sock.ev.on('call', async (calls: any) => {
      try {
        await this.handleCallEvents(sock, calls);
      } catch (err) {
        logger.error('Error in call event handler', err);
      }
    });

    sock.ev.on('messages.update', async (updates: any) => {
      try {
        await this.handleMessageUpdates(sock, updates);
      } catch (err) {
        logger.error('Error in message update handler (anti-delete)', err);
      }
    });
  }

  public async handleGroupParticipantsUpdate(sock: WASocket, event: GroupParticipantUpdate): Promise<void> {
    const { id: groupId, participants, action, author } = event;

    if (action === 'add') {
      const welcomeEnabled = db.getGroupSetting(groupId, 'welcome', 'true') === 'true';
      if (welcomeEnabled) {
        const customMsg = db.getGroupSetting(groupId, 'welcome_msg') || '👋 Welcome @user to the group!';
        for (const participant of participants) {
          const userJid = formatJid(participant);
          const userTag = `@${participant.split('@')[0]}`;
          const formattedText = customMsg.replace('@user', userTag);

          await sock.sendMessage(groupId, {
            text: formattedText,
            mentions: [userJid],
          });
        }
      }
    } else if (action === 'remove') {
      const goodbyeEnabled = db.getGroupSetting(groupId, 'goodbye', 'true') === 'true';
      if (goodbyeEnabled) {
        const customMsg = db.getGroupSetting(groupId, 'goodbye_msg') || '👋 Goodbye @user!';
        for (const participant of participants) {
          const userJid = formatJid(participant);
          const userTag = `@${participant.split('@')[0]}`;
          const formattedText = customMsg.replace('@user', userTag);

          await sock.sendMessage(groupId, {
            text: formattedText,
            mentions: [userJid],
          });
        }
      }
    } else if (action === 'demote') {
      const antiDemoteEnabled = db.getGroupSetting(groupId, 'antidemote', 'false') === 'true';
      if (antiDemoteEnabled && author) {
        logger.info(`Anti-demote triggered in ${groupId} by ${author}`);
        for (const participant of participants) {
          try {
            await sock.groupParticipantsUpdate(groupId, [participant], 'promote');
            await sock.sendMessage(groupId, {
              text: `⚠️ Anti-Demote Active: Re-promoted @${participant.split('@')[0]}.`,
              mentions: [participant],
            });
          } catch (err) {
            logger.error('Failed to re-promote admin during anti-demote', err);
          }
        }
      }
      db.addAuditLog('admin_demote', author || 'system', `Demoted ${participants.join(', ')} in ${groupId}`);
    } else if (action === 'promote') {
      db.addAuditLog('admin_promote', author || 'system', `Promoted ${participants.join(', ')} in ${groupId}`);
    }
  }

  public async handleCallEvents(sock: WASocket, calls: CallUpdate[]): Promise<void> {
    const antiCallEnabled = db.getSetting('anticall', 'true') === 'true';
    const antiCallBlock = db.getSetting('anticall_block', 'false') === 'true';

    for (const call of calls) {
      if (call.status === 'offer' && antiCallEnabled) {
        logger.warn(`Rejecting call from ${call.from}`);
        try {
          await sock.rejectCall(call.id, call.from);
          await sock.sendMessage(call.from, {
            text: '⚠️ Calls are not accepted by Hemix Bot.',
          });

          if (antiCallBlock) {
            db.blockUser(call.from);
            await sock.updateBlockStatus(call.from, 'block');
            logger.warn(`Blocked ${call.from} due to anti-call policy.`);
          }
        } catch (err) {
          logger.error(`Failed to execute anti-call actions for ${call.from}`, err);
        }
      }
    }
  }

  public async handleMessageUpdates(sock: WASocket, updates: any[]): Promise<void> {
    for (const update of updates) {
      if (update.update?.protocolMessage?.type === 0 || update.update?.message === null) {
        const key = update.key;
        if (!key?.id) continue;

        const cachedMsg = this.messageCache.get<proto.IWebMessageInfo>(key.id);
        if (!cachedMsg) continue;

        const chatId = key.remoteJid || '';
        const isAntiDeleteEnabled = db.getSetting('antidelete', 'true') === 'true';

        if (isAntiDeleteEnabled && chatId) {
          const sender = cachedMsg.key.participant || cachedMsg.key.remoteJid || 'Unknown';
          const deletedText =
            cachedMsg.message?.conversation ||
            cachedMsg.message?.extendedTextMessage?.text ||
            cachedMsg.message?.imageMessage?.caption ||
            cachedMsg.message?.videoMessage?.caption ||
            '[Media / Non-text Content]';

          const notification = `🚨 *ANTI-DELETE DETECTED* 🚨\n👤 *Sender:* @${sender.split('@')[0]}\n💬 *Message:* ${deletedText}`;

          await sock.sendMessage(
            chatId,
            { text: notification, mentions: [sender] },
            { quoted: cachedMsg }
          );
        }
      }
    }
  }

  public getCacheStats(): { keysCount: number } {
    return { keysCount: this.messageCache.keys().length };
  }
}

export const eventHandler = new EventHandler();
export default eventHandler;
