import { CommandContext } from '../types';
import axios from 'axios';

export default {
  name: 'fbaudio',
  alias: ['fbmp3'],
  category: 'Download',
  description: 'Download Facebook video as audio',
  usage: '.fbaudio <URL>',
  permission: 1,
  cooldown: 10,
  handler: async (ctx: CommandContext) => {
    if (!ctx.text) { await ctx.reply('🎵 Please provide a Facebook video URL!'); return; }
    await ctx.reply('⬇️ Downloading Facebook audio...');
    try {
      const res = await axios.get(`https://api.fbdownloader.com/api/?url=${encodeURIComponent(ctx.text)}`);
      if (res.data?.url) {
        const audioRes = await axios.get(res.data.url, { responseType: 'arraybuffer' });
        await ctx.replyMedia(Buffer.from(audioRes.data), 'audio/mpeg', '🎵 Facebook Audio');
      } else { await ctx.reply('❌ Failed to download!'); }
    } catch (err: any) { await ctx.reply(`❌ Error: ${err.message}`); }
  },
};
