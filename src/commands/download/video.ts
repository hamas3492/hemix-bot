import { CommandContext } from '../types';

export default {
  name: 'video',
  alias: ['ytvideo', 'ytv'],
  category: 'Download',
  description: 'Download video from YouTube',
  usage: '.video <URL or search>',
  permission: 1,
  cooldown: 10,
  handler: async (ctx: CommandContext) => {
    if (!ctx.text) { await ctx.reply('📺 Please provide a URL or search term!'); return; }
    await ctx.reply(`🔍 Fetching video...`);
    try {
      const ytdl = require('@distube/ytdl-core');
      const ytsearch = require('yt-search');
      let url = ctx.text;
      if (!ctx.text.includes('youtube.com') && !ctx.text.includes('youtu.be')) {
        const result = await ytsearch(ctx.text);
        url = result.videos[0]?.url;
        if (!url) { await ctx.reply('❌ No results found!'); return; }
      }
      const info = await ytdl.getInfo(url);
      await ctx.reply(`🎬 Title: ${info.videoDetails.title}\n⬇️ Downloading...`);
      const stream = ytdl(url, { quality: 'highest', filter: 'videoandaudio' });
      const chunks: Buffer[] = [];
      for await (const chunk of stream) { chunks.push(chunk); }
      const buffer = Buffer.concat(chunks);
      if (buffer.length > 100 * 1024 * 1024) { await ctx.reply('❌ Video too large to send!'); return; }
      await ctx.client.sendMessage(ctx.jid, { video: buffer, caption: `🎬 ${info.videoDetails.title}` });
    } catch (err: any) {
      await ctx.reply(`❌ Error: ${err.message}`);
    }
  },
};
