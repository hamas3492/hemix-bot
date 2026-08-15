import { CommandContext } from '../types';

export default {
  name: 'forward',
  alias: ['fwd'],
  category: 'tools',
  description: 'Forward quoted message to a target chat JID',
  usage: 'forward <JID>',
  permission: 0,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    if (!ctx.quoted) {
      return await ctx.reply('⚠️ Please reply to a message you want to forward.');
    }

    const targetJid = ctx.args[0];
    if (!targetJid) {
      return await ctx.reply('⚠️ Please specify target JID or phone number (e.g. `forward 123456789@s.whatsapp.net`)');
    }

    const cleanJid = targetJid.includes('@') ? targetJid : `${targetJid.replace(/[^0-9]/g, '')}@s.whatsapp.net`;

    try {
      await ctx.client.sendMessage(cleanJid, { forward: ctx.quoted.message || ctx.quoted });
      await ctx.reply(`✅ Message successfully forwarded to \`${cleanJid}\``);
    } catch (err) {
      await ctx.reply(`❌ Failed to forward message: ${(err as Error).message}`);
    }
  },
};
