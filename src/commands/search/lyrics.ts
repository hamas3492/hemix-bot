import { CommandContext } from '../types';
import axios from 'axios';

export default {
  name: 'lyrics',
  alias: ['lyric'],
  category: 'Search',
  description: 'Search song lyrics',
  usage: '.lyrics <song name>',
  permission: 1,
  cooldown: 5,
  handler: async (ctx: CommandContext) => {
    if (!ctx.text) { await ctx.reply('🎵 Please provide a song name!'); return; }
    try {
      const res = await axios.get(`https://api.lyrics.ovh/v1/${encodeURIComponent(ctx.text)}/${encodeURIComponent(ctx.text)}`, { timeout: 10000 });
      if (res.data?.lyrics) {
        const lyrics = res.data.lyrics.length > 2000 ? res.data.lyrics.slice(0, 2000) + '\n...[truncated]' : res.data.lyrics;
        await ctx.reply(`🎵 *Lyrics: ${ctx.text}*\n\n${lyrics}`);
      } else { await ctx.reply('❌ Lyrics not found!'); }
    } catch (err: any) { await ctx.reply(`❌ Error: ${err.message}`); }
  },
};
