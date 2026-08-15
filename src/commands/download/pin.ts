import { CommandContext } from '../types';
import axios from 'axios';

export default {
  name: 'pin',
  alias: ['pinterest', 'pindl'],
  category: 'Download',
  description: 'Download Pinterest video/image',
  usage: '.pin <URL>',
  permission: 1,
  cooldown: 10,
  handler: async (ctx: CommandContext) => {
    if (!ctx.text) { await ctx.reply('📌 Please provide a Pinterest URL!'); return; }
    await ctx.reply('⬇️ Downloading Pinterest content...');
    try {
      const res = await axios.get(`https://api.pinterestdownloader.com/api/?url=${encodeURIComponent(ctx.text)}`);
      if (res.data?.url) {
        const mediaRes = await axios.get(res.data.url, { responseType: 'arraybuffer' });
        const type = res.data.type || 'image';
        if (type === 'video') {
          await ctx.client.sendMessage(ctx.jid, { video: Buffer.from(mediaRes.data), caption: '📌 Pinterest Video' });
        } else {
          await ctx.client.sendMessage(ctx.jid, { image: Buffer.from(mediaRes.data), caption: '📌 Pinterest Image' });
        }
      } else { await ctx.reply('❌ Failed to download!'); }
    } catch (err: any) { await ctx.reply(`❌ Error: ${err.message}`); }
  },
};
