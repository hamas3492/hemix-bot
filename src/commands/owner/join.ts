import { CommandContext } from '../types';
export default {
  name: 'join', alias: ['joingroup'], category: 'Owner', description: 'Join group via invite link', usage: '.join <link>', permission: 4, cooldown: 5,
  handler: async (ctx: CommandContext) => {
    if (!ctx.text) { await ctx.reply('Usage: .join <invite link>'); return; }
    try {
      const match = ctx.text.match(/chat\.whatsapp\.com\/([a-zA-Z0-9]+)/);
      if (!match) { await ctx.reply('❌ Invalid invite link!'); return; }
      const code = match[1];
      const res = await ctx.client.groupAcceptInvite(code);
      await ctx.reply(`✅ Joined group: ${res}`);
    } catch (err: any) { await ctx.reply(`❌ Error: ${err.message}`); }
  },
};
