import { CommandContext } from '../types';
import axios from 'axios';

export default {
  name: 'mediafire',
  alias: ['mf'],
  category: 'Download',
  description: 'Download from MediaFire',
  usage: '.mediafire <URL>',
  permission: 1,
  cooldown: 10,
  handler: async (ctx: CommandContext) => {
    if (!ctx.text) { await ctx.reply('📁 Please provide a MediaFire URL!'); return; }
    await ctx.reply('⬇️ Fetching MediaFire link...');
    try {
      const res = await axios.get(ctx.text, { timeout: 15000 });
      const dlLink = res.data?.match(/https?:\/\/download[^\s"']+/)?.[0];
      if (dlLink) {
        await ctx.reply(`📁 Direct link: ${dlLink}`);
      } else { await ctx.reply('❌ Could not extract download link!'); }
    } catch (err: any) { await ctx.reply(`❌ Error: ${err.message}`); }
  },
};
