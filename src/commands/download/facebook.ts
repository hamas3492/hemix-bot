import { CommandContext } from '../types';
import axios from 'axios';

export default {
  name: 'facebook',
  alias: ['fb', 'fbvideo'],
  category: 'Download',
  description: 'Download Facebook video',
  usage: '.facebook <URL>',
  permission: 1,
  cooldown: 10,
  handler: async (ctx: CommandContext) => {
    if (!ctx.text) { await ctx.reply('📹 Please provide a Facebook video URL!'); return; }
    await ctx.reply('⬇️ Downloading Facebook video...');
    try {
      const res = await axios.get(`https://api.fbdownloader.com/api/?url=${encodeURIComponent(ctx.text)}`);
      if (res.data?.url) {
        const videoRes = await axios.get(res.data.url, { responseType: 'arraybuffer' });
        await ctx.client.sendMessage(ctx.jid, { video: Buffer.from(videoRes.data), caption: '📹 Facebook Video' });
      } else { await ctx.reply('❌ Failed to download!'); }
    } catch (err: any) { await ctx.reply(`❌ Error: ${err.message}`); }
  },
};
