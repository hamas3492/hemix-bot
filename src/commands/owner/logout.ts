import { CommandContext } from '../types';
export default {
  name: 'logout', alias: ['lg'], category: 'Owner', description: 'Logout WhatsApp session', usage: '.logout', permission: 4, cooldown: 10,
  handler: async (ctx: CommandContext) => {
    try {
      await ctx.client.logout(ctx.jid);
      await ctx.reply('✅ Logged out! Delete data/session and restart.');
    } catch (err: any) { await ctx.reply(`❌ Error: ${err.message}`); }
  },
};
