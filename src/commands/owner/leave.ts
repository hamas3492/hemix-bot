import { CommandContext } from '../types';
export default {
  name: 'leave', alias: ['leavegroup'], category: 'Owner', description: 'Leave current group', usage: '.leave', permission: 4, cooldown: 5,
  handler: async (ctx: CommandContext) => {
    if (!ctx.isGroup) { await ctx.reply('❌ Group only!'); return; }
    try { await ctx.client.groupLeave(ctx.jid); } catch (err: any) { await ctx.reply(`❌ Error: ${err.message}`); }
  },
};
