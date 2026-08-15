import { CommandContext } from '../types';
export default {
  name: 'setdesc', alias: ['description'], category: 'Group', description: 'Set group description', usage: '.setdesc <text>', permission: 2, cooldown: 5,
  handler: async (ctx: CommandContext) => {
    if (!ctx.isGroup || !ctx.text) { await ctx.reply('Usage: .setdesc <text>'); return; }
    try { await ctx.client.groupUpdateDescription(ctx.jid, ctx.text); await ctx.reply('✅ Description updated!'); } catch (err: any) { await ctx.reply(`❌ Error: ${err.message}`); }
  },
};
