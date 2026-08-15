import { CommandContext } from '../types';
export default {
  name: 'setbio', alias: ['bio'], category: 'Owner', description: 'Set bot bio/about', usage: '.setbio <text>', permission: 4, cooldown: 5,
  handler: async (ctx: CommandContext) => {
    if (!ctx.text) { await ctx.reply('Usage: .setbio <text>'); return; }
    try { await ctx.client.updateProfileStatus(ctx.text); await ctx.reply('✅ Bio updated!'); } catch (err: any) { await ctx.reply(`❌ Error: ${err.message}`); }
  },
};
