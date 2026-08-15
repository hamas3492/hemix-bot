import { CommandContext } from '../types';

export default {
  name: 'userid',
  alias: ['uid', 'whois', 'jid'],
  category: 'tools',
  description: 'Get user WhatsApp ID / JID from mention, reply, or self',
  usage: 'userid [@mention or reply]',
  permission: 0,
  cooldown: 2,
  handler: async (ctx: CommandContext) => {
    let targetJid = ctx.sender;
    let targetName = ctx.senderName;

    if (ctx.message?.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
      targetJid = ctx.message.message.extendedTextMessage.contextInfo.mentionedJid[0];
      targetName = targetJid.split('@')[0];
    } else if (ctx.quoted?.sender) {
      targetJid = ctx.quoted.sender;
      targetName = targetJid.split('@')[0];
    }

    const phone = targetJid.replace(/[^0-9]/g, '');

    const text = `👤 *USER IDENTIFIER*

📛 *Name / Mention:* ${targetName}
🆔 *Full JID:* \`${targetJid}\`
📞 *Phone Number:* +${phone}`;

    await ctx.reply(text);
  },
};
