import { CommandContext } from '../types';
import axios from 'axios';

export default {
  name: 'tiktok',
  alias: ['tt', 'tiktokdl'],
  category: 'Download',
  description: 'Download TikTok video',
  usage: '.tiktok <URL>',
  permission: 1,
  cooldown: 10,
  handler: async (ctx: CommandContext) => {
    if (!ctx.text) { await ctx.reply('🎵 Please provide a TikTok URL!'); return; }
    await ctx.reply('⬇️ Downloading TikTok video...');
    try {
      const res = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(ctx.text)}`);
      if (res.data?.data?.play) {
        const videoRes = await axios.get(res.data.data.play, { responseType: 'arraybuffer' });
        await ctx.client.sendMessage(ctx.jid, { video: Buffer.from(videoRes.data), caption: `🎵 TikTok Video` });
      } else { await ctx.reply('❌ Failed to download!'); }
    } catch (err: any) { await ctx.reply(`❌ Error: ${err.message}`); }
  },
};
