import { CommandContext } from '../types';
import axios from 'axios';

export default {
  name: 'tiktokaudio',
  alias: ['ttaudio', 'tiktokmp3'],
  category: 'Download',
  description: 'Download TikTok audio',
  usage: '.tiktokaudio <URL>',
  permission: 1,
  cooldown: 10,
  handler: async (ctx: CommandContext) => {
    if (!ctx.text) { await ctx.reply('🎵 Please provide a TikTok URL!'); return; }
    await ctx.reply('⬇️ Downloading TikTok audio...');
    try {
      const res = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(ctx.text)}`);
      if (res.data?.data?.music) {
        const audioRes = await axios.get(res.data.data.music, { responseType: 'arraybuffer' });
        await ctx.replyMedia(Buffer.from(audioRes.data), 'audio/mpeg', '🎵 TikTok Audio');
      } else { await ctx.reply('❌ Failed to download!'); }
    } catch (err: any) { await ctx.reply(`❌ Error: ${err.message}`); }
  },
};
