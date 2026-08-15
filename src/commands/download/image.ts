import { CommandContext } from '../types';
import axios from 'axios';

export default {
  name: 'image',
  alias: ['img', 'googleimage'],
  category: 'Download',
  description: 'Download image from URL or search',
  usage: '.image <query or URL>',
  permission: 1,
  cooldown: 5,
  handler: async (ctx: CommandContext) => {
    if (!ctx.text) { await ctx.reply('🖼️ Please provide a query or URL!'); return; }
    try {
      if (ctx.text.startsWith('http')) {
        const res = await axios.get(ctx.text, { responseType: 'arraybuffer', timeout: 10000 });
        await ctx.client.sendMessage(ctx.jid, { image: Buffer.from(res.data), caption: '🖼️ Image' });
      } else {
        const res = await axios.get(`https://www.googleapis.com/customsearch/v1`, { params: { q: ctx.text, searchType: 'image', key: process.env.GOOGLE_API_KEY || '', cx: process.env.GOOGLE_CX || '' }, timeout: 10000 });
        if (res.data?.items?.[0]?.link) {
          const imgRes = await axios.get(res.data.items[0].link, { responseType: 'arraybuffer', timeout: 10000 });
          await ctx.client.sendMessage(ctx.jid, { image: Buffer.from(imgRes.data), caption: `🖼️ ${ctx.text}` });
        } else { await ctx.reply('❌ No images found!'); }
      }
    } catch (err: any) { await ctx.reply(`❌ Error: ${err.message}`); }
  },
};
