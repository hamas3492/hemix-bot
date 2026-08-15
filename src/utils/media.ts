import { downloadMediaMessage } from '@whiskeysockets/baileys';
import axios from 'axios';

/**
 * Get target JID from message context (mentioned user, quoted sender, or sender itself)
 */
export function getTargetJid(ctx: any): string {
  if (ctx.message?.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
    return ctx.message.message.extendedTextMessage.contextInfo.mentionedJid[0];
  }
  if (ctx.quoted?.sender) {
    return ctx.quoted.sender;
  }
  return ctx.sender;
}

/**
 * Get target display name
 */
export function getTargetName(ctx: any): string {
  if (ctx.args && ctx.args.length > 0) {
    const rawName = ctx.args.join(' ').replace(/@\d+/g, '').trim();
    if (rawName) return rawName;
  }
  return ctx.senderName || 'Friend';
}

/**
 * Fetch profile picture URL for a JID, with fallback default avatar
 */
export async function getAvatarUrl(client: any, jid: string): Promise<string> {
  const fallbackUrl = 'https://i.imgur.com/2Xy5E60.png';
  if (!client || !jid) return fallbackUrl;

  try {
    const cleanJid = jid.includes('@') ? jid : `${jid.replace(/[^0-9]/g, '')}@s.whatsapp.net`;
    const url = await client.profilePictureUrl(cleanJid, 'image');
    return url || fallbackUrl;
  } catch (err) {
    return fallbackUrl;
  }
}

/**
 * Try to extract image buffer from current message or quoted message
 */
export async function getImageBuffer(ctx: any): Promise<Buffer | null> {
  try {
    const msg = ctx.quoted?.message ? ctx.quoted : ctx.message;
    const messageContent = msg?.message || msg;

    if (
      messageContent?.imageMessage ||
      messageContent?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage
    ) {
      const buffer = await downloadMediaMessage(
        msg,
        'buffer',
        {},
        {
          logger: undefined as any,
          reuploadRequest: (async () => {}) as any,
        }
      );
      return buffer as Buffer;
    }
  } catch (err) {
    // Media download failed
  }
  return null;
}

/**
 * Helper to download an image from a URL as Buffer
 */
export async function fetchBuffer(url: string): Promise<Buffer | null> {
  try {
    const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 10000 });
    return Buffer.from(res.data);
  } catch (err) {
    return null;
  }
}
