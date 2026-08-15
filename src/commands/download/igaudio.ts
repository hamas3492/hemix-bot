import { CommandContext } from '../types';
import axios from 'axios';

export default {
  name: 'igaudio',
  alias: ['igmp3'],
  category: 'Download',
  description: 'Download Instagram audio',
  usage: '.igaudio <URL>',
  permission: 1,
  cooldown: 10,
  handler: async (ctx: CommandContext) => {
    if (!ctx.text) { await ctx.reply('🎵 Please provide an Instagram URL!'); return; }
    await ctx.reply('⬇️ Downloading Instagram audio...');
    try {
      const res = await axios.get(`https://api.instagramdownloader.com/api/?url=${encodeURIComponent(ctx.text)}`);
      if (res.data?.media) {
        const media = Array.isArray(res.data.media) ? res.data.media[0] : res.data.media;
        if (media.url) {
          const audioRes = await axios.get(media.url, { responseType: 'arraybuffer' });
          await ctx.replyMedia(Buffer.from(audioRes.data), 'audio/mpeg', '🎵 Instagram Audio');
        }
      } else { await ctx.reply('❌ Failed to download!'); }
    } catch (err: any) { await ctx.reply(`❌ Error: ${err.message}`); }
  },
};
