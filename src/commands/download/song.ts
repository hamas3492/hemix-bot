import { CommandContext } from '../types';
import axios from 'axios';

export default {
  name: 'song',
  alias: ['play'],
  category: 'Download',
  description: 'Download song from YouTube',
  usage: '.song <song name>',
  permission: 1,
  cooldown: 10,
  handler: async (ctx: CommandContext) => {
    if (!ctx.text) { await ctx.reply('🎵 Please provide a song name!'); return; }
    await ctx.reply(`🔍 Searching for "${ctx.text}"...`);
    try {
      const ytsearch = require('yt-search');
      const result = await ytsearch(ctx.text);
      const video = result.videos[0];
      if (!video) { await ctx.reply('❌ No results found!'); return; }
      await ctx.reply(`🎵 Found: ${video.title}\n⏱ Duration: ${video.timestamp}\n🔗 ${video.url}\n\n⬇️ Downloading audio...`);
      const ytdl = require('@distube/ytdl-core');
      const stream = ytdl(video.url, { quality: 'highestaudio', filter: 'audioonly' });
      const chunks: Buffer[] = [];
      for await (const chunk of stream) { chunks.push(chunk); }
      const buffer = Buffer.concat(chunks);
      await ctx.replyMedia(buffer, 'audio/mpeg', `🎵 ${video.title}`);
    } catch (err: any) {
      await ctx.reply(`❌ Error: ${err.message}`);
    }
  },
};
