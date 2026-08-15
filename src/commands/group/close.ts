import { CommandContext } from '../types';
export default {
  name: 'close', alias: ['lockgroup'], category: 'Group', description: 'Close group (admin only)', usage: '.close', permission: 2, cooldown: 5,
  handler: async (ctx: CommandContext) => {
    if (!ctx.isGroup) { await ctx.reply('❌ Group only!'); return; }
    try { await ctx.client.groupSettingUpdate(ctx.jid, 'announcement'); await ctx.reply('✅ Group closed! Only admins can send messages.'); } catch (err: any) { await ctx.reply(`❌ Error: ${err.message}`); }
  },
};
