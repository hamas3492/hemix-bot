import { CommandContext } from '../types/command';

export function formatNumberToJid(numStr: string): string {
  if (!numStr) return '';
  let cleaned = numStr.trim();
  if (cleaned.includes('@')) {
    return cleaned;
  }
  cleaned = cleaned.replace(/[^0-9]/g, '');
  if (!cleaned) return '';
  return `${cleaned}@s.whatsapp.net`;
}

export function getTargetJid(ctx: CommandContext): string | null {
  // Check context mentions
  const mentions = ctx.message?.message?.extendedTextMessage?.contextInfo?.mentionedJid ||
                   ctx.message?.message?.ephemeralMessage?.message?.extendedTextMessage?.contextInfo?.mentionedJid;
  if (mentions && mentions.length > 0) {
    return mentions[0];
  }

  // Check quoted message participant
  if (ctx.quoted) {
    const quotedSender = ctx.quoted.sender ||
                         ctx.quoted.participant ||
                         ctx.quoted.key?.participant ||
                         ctx.quoted.key?.remoteJid;
    if (quotedSender && !quotedSender.endsWith('@g.us')) {
      return quotedSender;
    }
  }

  // Check args
  if (ctx.args && ctx.args.length > 0) {
    const arg = ctx.args[0];
    if (arg.includes('@')) {
      const cleaned = arg.replace(/[^0-9@]/g, '');
      if (cleaned.includes('@s.whatsapp.net')) return cleaned;
      const numOnly = arg.replace(/[^0-9]/g, '');
      if (numOnly) return `${numOnly}@s.whatsapp.net`;
    } else {
      const numOnly = arg.replace(/[^0-9]/g, '');
      if (numOnly) return `${numOnly}@s.whatsapp.net`;
    }
  }

  return null;
}

export function isBotAdmin(ctx: CommandContext): boolean {
  if (!ctx.isGroup || !ctx.groupMetadata) return false;
  const botJid = ctx.client?.user?.id ? ctx.client.user.id.replace(/:\d+@/g, '@') : '';
  const botNumber = botJid.replace(/[^0-9]/g, '');
  if (!botNumber) return false;

  const participants = ctx.groupMetadata.participants || [];
  const botParticipant = participants.find((p: any) => {
    const pJid = (p.id || p.jid || '').replace(/[^0-9]/g, '');
    return pJid === botNumber;
  });

  return botParticipant && (botParticipant.admin === 'admin' || botParticipant.admin === 'superadmin');
}

export function isSenderAdmin(ctx: CommandContext): boolean {
  if (!ctx.isGroup || !ctx.groupMetadata) return false;
  const senderNumber = (ctx.sender || '').replace(/[^0-9]/g, '');
  if (!senderNumber) return false;

  const participants = ctx.groupMetadata.participants || [];
  const senderParticipant = participants.find((p: any) => {
    const pJid = (p.id || p.jid || '').replace(/[^0-9]/g, '');
    return pJid === senderNumber;
  });

  return senderParticipant && (senderParticipant.admin === 'admin' || senderParticipant.admin === 'superadmin');
}

export function parseDuration(durationStr: string): number | null {
  if (!durationStr) return null;
  const match = durationStr.trim().match(/^(\d+)\s*([s|m|h|d])?$/i);
  if (!match) return null;

  const value = parseInt(match[1], 10);
  const unit = (match[2] || 'm').toLowerCase();

  switch (unit) {
    case 's': return value * 1000;
    case 'm': return value * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    case 'd': return value * 24 * 60 * 60 * 1000;
    default: return value * 60 * 1000;
  }
}

export function handleAntiToggle(
  ctx: CommandContext,
  featureName: string,
  settingKey: string
): Promise<any> {
  if (!ctx.isGroup) {
    return ctx.reply('❌ This command can only be used in group chats.');
  }

  const currentSetting = ctx.db.getGroupSetting(ctx.jid, settingKey, 'disabled');
  const arg = ctx.args[0]?.toLowerCase().trim();

  let newState: string;
  if (arg === 'on' || arg === 'enable' || arg === '1' || arg === 'true') {
    newState = 'enabled';
  } else if (arg === 'off' || arg === 'disable' || arg === '0' || arg === 'false') {
    newState = 'disabled';
  } else if (!arg || arg === 'status') {
    const isEnabled = currentSetting === 'enabled';
    return ctx.reply(`🛡️ *Anti-${featureName} Status*\n\nStatus: *${isEnabled ? 'ENABLED 🟢' : 'DISABLED 🔴'}*\n\nUsage: .anti${featureName.toLowerCase()} [on|off]`);
  } else {
    newState = currentSetting === 'enabled' ? 'disabled' : 'enabled';
  }

  ctx.db.setGroupSetting(ctx.jid, settingKey, newState);
  const isNowEnabled = newState === 'enabled';
  return ctx.reply(`🛡️ *Anti-${featureName}*\n\nAnti-${featureName} has been *${isNowEnabled ? 'ENABLED 🟢' : 'DISABLED 🔴'}* for this group.`);
}
