import { CommandContext } from '../types';
import axios from 'axios';

export default {
  name: 'imdb',
  alias: ['movie'],
  category: 'Search',
  description: 'Search movie/series info',
  usage: '.imdb <title>',
  permission: 1,
  cooldown: 5,
  handler: async (ctx: CommandContext) => {
    if (!ctx.text) { await ctx.reply('🎬 Please provide a movie title!'); return; }
    try {
      const key = process.env.OMDB_API_KEY || 'thewdb';
      const res = await axios.get(`https://www.omdbapi.com/?t=${encodeURIComponent(ctx.text)}&apikey=${key}`, { timeout: 10000 });
      if (res.data?.Response === 'True') {
        const m = res.data;
        let text = `🎬 *${m.Title}* (${m.Year})\n\n`;
        text += `⭐ Rating: ${m.imdbRating}/10\n`;
        text += `🎭 Genre: ${m.Genre}\n`;
        text += `⏱ Runtime: ${m.Runtime}\n`;
        text += `🎬 Director: ${m.Director}\n`;
        text += `👥 Actors: ${m.Actors}\n`;
        text += `📝 Plot: ${m.Plot}\n`;
        if (m.Poster && m.Poster !== 'N/A') text += `\n🖼️ Poster: ${m.Poster}`;
        await ctx.reply(text);
      } else { await ctx.reply('❌ Movie not found!'); }
    } catch (err: any) { await ctx.reply(`❌ Error: ${err.message}`); }
  },
};
