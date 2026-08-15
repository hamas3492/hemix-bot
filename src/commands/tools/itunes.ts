import { CommandContext } from '../types';
import axios from 'axios';

export default {
  name: 'itunes',
  alias: ['songinfo', 'itunessearch'],
  category: 'tools',
  description: 'Search songs and track details on iTunes',
  usage: 'itunes <song or artist>',
  permission: 0,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const query = ctx.text || ctx.args.join(' ');
    if (!query) {
      return await ctx.reply('⚠️ Please enter a song title or artist name.');
    }

    try {
      const res = await axios.get(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=1`, { timeout: 8000 });
      const track = res.data?.results?.[0];

      if (!track) {
        return await ctx.reply(`❌ No iTunes results found for "${query}".`);
      }

      const info = `🎵 *ITUNES TRACK DETAILS*

🎶 *Title:* ${track.trackName}
🎤 *Artist:* ${track.artistName}
💿 *Album:* ${track.collectionName}
📅 *Release Date:* ${new Date(track.releaseDate).toLocaleDateString()}
🎼 *Genre:* ${track.primaryGenreName}
🔗 *iTunes URL:* ${track.trackViewUrl}
🔊 *Audio Preview:* ${track.previewUrl}`;

      await ctx.reply(info);
    } catch (err) {
      await ctx.reply(`❌ iTunes search failed: ${(err as Error).message}`);
    }
  },
};
