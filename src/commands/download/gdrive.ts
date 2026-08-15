import { CommandContext } from '../types';

export default {
  name: 'gdrive',
  alias: ['googledrive'],
  category: 'Download',
  description: 'Download from Google Drive',
  usage: '.gdrive <share link>',
  permission: 1,
  cooldown: 10,
  handler: async (ctx: CommandContext) => {
    if (!ctx.text) { await ctx.reply('📁 Please provide a Google Drive link!'); return; }
    try {
      const match = ctx.text.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (!match) { await ctx.reply('❌ Invalid Google Drive URL!'); return; }
      const fileId = match[1];
      await ctx.reply(`📁 File ID: ${fileId}\n⚠️ Direct download requires authentication for large files.`);
    } catch (err: any) { await ctx.reply(`❌ Error: ${err.message}`); }
  },
};
