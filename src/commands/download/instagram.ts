import { CommandContext } from '../types';
import axios from 'axios';

export default {
  name: 'instagram',
  alias: ['ig', 'insta'],
  category: 'Download',
  description: 'Download Instagram reel/post',
  usage: '.instagram <URL>',
  permission: 1,
  cooldown: 10,
  handler: async (ctx: CommandContext) => {
    if (!ctx.text) { await ctx.reply('📸 Please provide an Instagram URL!'); return; }
    await ctx.reply('⬇️ Downloading Instagram content...');
    try {
      const res = await axios.get(`https://api.instagramdownloader.com/api/?url=${encodeURIComponent(ctx.text)}`);
      if (res.data?.media) {
        const media = Array.isArray(res.data.media) ? res.data.media : [res.data.media];
        for (const item of media) {
          if (item.type === 'video') {
            const videoRes = await axios.get(item.url, { responseType: 'arraybuffer' });
            await ctx.client.sendMessage(ctx.jid, { video: Buffer.from(videoRes.data), caption: '📸 Instagram Video' });
          } else {
            const imgRes = await axios.get(item.url, { responseType: 'arraybuffer' });
            await ctx.client.sendMessage(ctx.jid, { image: Buffer.from(imgRes.data), caption: '📸 Instagram Image' });
          }
        }
      } else { await ctx.reply('❌ Failed to download!'); }
    } catch (err: any) { await ctx.reply(`❌ Error: ${err.message}`); }
  },
};
