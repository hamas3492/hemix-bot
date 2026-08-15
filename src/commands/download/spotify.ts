import { CommandContext } from '../types';
import axios from 'axios';

export default {
  name: 'spotify',
  alias: ['sp', 'spotifysong'],
  category: 'Download',
  description: 'Search Spotify track info',
  usage: '.spotify <song name>',
  permission: 1,
  cooldown: 10,
  handler: async (ctx: CommandContext) => {
    if (!ctx.text) { await ctx.reply('🎵 Please provide a song name!'); return; }
    try {
      const res = await axios.get(`https://api.spotifydown.com/metadata?link=${encodeURIComponent(ctx.text)}`);
      if (res.data) {
        await ctx.reply(`🎵 *Spotify Info*\n\nTitle: ${res.data.title || 'N/A'}\nArtist: ${res.data.artist || 'N/A'}\nAlbum: ${res.data.album || 'N/A'}\nDuration: ${res.data.duration || 'N/A'}`);
      } else { await ctx.reply('❌ No results found!'); }
    } catch (err: any) { await ctx.reply(`❌ Error: ${err.message}`); }
  },
};
