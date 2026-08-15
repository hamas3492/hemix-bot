import { CommandContext } from '../types';

export default {
  name: 'yts',
  alias: ['ytsearch', 'youtubesearch'],
  category: 'Download',
  description: 'Search YouTube',
  usage: '.yts <query>',
  permission: 1,
  cooldown: 5,
  handler: async (ctx: CommandContext) => {
    if (!ctx.text) { await ctx.reply('🔍 Please provide a search term!'); return; }
    try {
      const ytsearch = require('yt-search');
      const result = await ytsearch(ctx.text);
      let text = `🔍 *YouTube Search Results*\n\n`;
      for (let i = 0; i < Math.min(10, result.videos.length); i++) {
        const v = result.videos[i];
        text += `${i + 1}. *${v.title}*\n⏱ ${v.timestamp} | 👁 ${v.views} | ${v.url}\n\n`;
      }
      await ctx.reply(text);
    } catch (err: any) {
      await ctx.reply(`❌ Error: ${err.message}`);
    }
  },
};
