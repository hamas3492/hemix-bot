import { CommandContext } from '../types';
import { formatJid } from '../../utils/helpers';

export default {
  name: 'block',
  alias: ['blockuser'],
  category: 'owner',
  description: 'Block a user (args: number/jid)',
  usage: 'block <number|@mention|quoted>',
  permission: 4,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    let targetJid = '';

    if (ctx.quoted && ctx.quoted.sender) {
      targetJid = ctx.quoted.sender;
    } else if (ctx.args[0]) {
      targetJid = formatJid(ctx.args[0]);
    }

    if (!targetJid) {
      await ctx.reply(`❌ Please mention a user, reply to their message, or provide a phone number.`);
      return;
    }

    ctx.db.blockUser(targetJid);

    try {
      if (ctx.client && ctx.client.updateBlockStatus) {
        await ctx.client.updateBlockStatus(targetJid, 'block');
      }
    } catch {
      // Baileys updateBlockStatus fail fallback
    }

    await ctx.reply(`🚫 *User blocked successfully!*\n📌 *JID:* \`${targetJid}\``);
  },
};
