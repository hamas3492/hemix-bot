import { CommandContext } from '../types';
import axios from 'axios';

export default {
  name: 'twitter',
  alias: ['tw', 'twdl'],
  category: 'Download',
  description: 'Download Twitter/X video',
  usage: '.twitter <URL>',
  permission: 1,
  cooldown: 10,
  handler: async (ctx: CommandContext) => {
    if (!ctx.text) { await ctx.reply('🐦 Please provide a Twitter/X URL!'); return; }
    await ctx.reply('⬇️ Downloading Twitter video...');
    try {
      const res = await axios.get(`https://api.twitterdownloader.com/api/?url=${encodeURIComponent(ctx.text)}`);
      if (res.data?.url) {
        const videoRes = await axios.get(res.data.url, { responseType: 'arraybuffer' });
        await ctx.client.sendMessage(ctx.jid, { video: Buffer.from(videoRes.data), caption: '🐦 Twitter Video' });
      } else { await ctx.reply('❌ Failed to download!'); }
    } catch (err: any) { await ctx.reply(`❌ Error: ${err.message}`); }
  },
};
