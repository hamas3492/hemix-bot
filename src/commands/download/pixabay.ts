import { CommandContext } from '../types';
import axios from 'axios';

export default {
  name: 'pixabay',
  alias: ['px'],
  category: 'Download',
  description: 'Search Pixabay images',
  usage: '.pixabay <query>',
  permission: 1,
  cooldown: 5,
  handler: async (ctx: CommandContext) => {
    if (!ctx.text) { await ctx.reply('🔍 Please provide a search query!'); return; }
    try {
      const key = process.env.PIXABAY_KEY || '';
      const res = await axios.get(`https://pixabay.com/api/?key=${key}&q=${encodeURIComponent(ctx.text)}&per_page=3`);
      if (res.data?.hits?.length > 0) {
        for (const hit of res.data.hits.slice(0, 3)) {
          const imgRes = await axios.get(hit.largeImageURL, { responseType: 'arraybuffer' });
          await ctx.client.sendMessage(ctx.jid, { image: Buffer.from(imgRes.data), caption: `🖼️ ${hit.tags}` });
        }
      } else { await ctx.reply('❌ No images found!'); }
    } catch (err: any) { await ctx.reply(`❌ Error: ${err.message}`); }
  },
};
