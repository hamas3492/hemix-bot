import { CommandContext } from '../types';

export default {
  name: 'song2',
  alias: ['play2'],
  category: 'Download',
  description: 'Alternative song download',
  usage: '.song2 <song name>',
  permission: 1,
  cooldown: 10,
  handler: async (ctx: CommandContext) => {
    if (!ctx.text) { await ctx.reply('🎵 Please provide a song name!'); return; }
    await ctx.reply(`🔍 Searching for "${ctx.text}"...`);
    try {
      const ytsearch = require('yt-search');
      const ytdl = require('@distube/ytdl-core');
      const result = await ytsearch(ctx.text);
      const video = result.videos[0];
      if (!video) { await ctx.reply('❌ No results found!'); return; }
      const stream = ytdl(video.url, { quality: 'highestaudio', filter: 'audioonly', highWaterMark: 1 << 25 });
      const chunks: Buffer[] = [];
      for await (const chunk of stream) { chunks.push(chunk); }
      await ctx.replyMedia(Buffer.concat(chunks), 'audio/mpeg', `🎵 ${video.title}`);
    } catch (err: any) { await ctx.reply(`❌ Error: ${err.message}`); }
  },
};
