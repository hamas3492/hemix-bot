import { CommandContext } from '../types';

export default {
  name: 'capcut',
  alias: ['cc'],
  category: 'Download',
  description: 'Download CapCut template info',
  usage: '.capcut <URL>',
  permission: 1,
  cooldown: 10,
  handler: async (ctx: CommandContext) => {
    if (!ctx.text) { await ctx.reply('🎬 Please provide a CapCut URL!'); return; }
    await ctx.reply('⬇️ Fetching CapCut template info...');
    try {
      await ctx.reply(`🎬 CapCut URL received. Template downloads require browser access.\nURL: ${ctx.text}`);
    } catch (err: any) { await ctx.reply(`❌ Error: ${err.message}`); }
  },
};
