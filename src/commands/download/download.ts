import { CommandContext } from '../types';

export default {
  name: 'download',
  alias: ['dl'],
  category: 'Download',
  description: 'Generic media downloader (auto-detect)',
  usage: '.download <URL>',
  permission: 1,
  cooldown: 10,
  handler: async (ctx: CommandContext) => {
    if (!ctx.text) { await ctx.reply('⬇️ Please provide a URL!'); return; }
    const url = ctx.text;
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      // Route to video command
      const ytdl = require('@distube/ytdl-core');
      try {
        const stream = ytdl(url, { quality: 'highest', filter: 'videoandaudio' });
        const chunks: Buffer[] = [];
        for await (const chunk of stream) { chunks.push(chunk); }
        await ctx.client.sendMessage(ctx.jid, { video: Buffer.concat(chunks), caption: '🎬 YouTube Video' });
      } catch (err: any) { await ctx.reply(`❌ Error: ${err.message}`); }
    } else if (url.includes('tiktok.com')) {
      try {
        const axios = require('axios');
        const res = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
        if (res.data?.data?.play) {
          const videoRes = await axios.get(res.data.data.play, { responseType: 'arraybuffer' });
          await ctx.client.sendMessage(ctx.jid, { video: Buffer.from(videoRes.data), caption: '🎵 TikTok Video' });
        }
      } catch (err: any) { await ctx.reply(`❌ Error: ${err.message}`); }
    } else if (url.includes('instagram.com')) {
      await ctx.reply('📸 Use .instagram <URL> for Instagram downloads');
    } else if (url.includes('facebook.com')) {
      await ctx.reply('📹 Use .facebook <URL> for Facebook downloads');
    } else {
      await ctx.reply('❌ Unsupported URL. Use specific commands: .video, .tiktok, .instagram, .facebook, .twitter');
    }
  },
};
