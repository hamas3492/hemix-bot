import { CommandContext } from '../types';
import axios from 'axios';

export default {
  name: 'wallpaper',
  alias: ['wp', 'wallpapers'],
  category: 'tools',
  description: 'Get random high-resolution wallpaper photo',
  usage: 'wallpaper <query e.g. nature|cars|anime>',
  permission: 0,
  cooldown: 4,
  handler: async (ctx: CommandContext) => {
    const query = ctx.text || ctx.args.join(' ') || 'aesthetic wallpaper';
    await ctx.reply(`🖼️ *Searching wallpapers for:* "${query}"...`);

    try {
      const imgUrl = `https://source.unsplash.com/1600x900/?${encodeURIComponent(query)}`;
      const res = await axios.get(imgUrl, { responseType: 'arraybuffer', timeout: 10000 });
      const buf = Buffer.from(res.data);

      if (ctx.replyMedia) {
        await ctx.replyMedia(buf, 'image/jpeg', `🖼️ *Wallpaper:* ${query}`);
      } else {
        await ctx.client.sendMessage(ctx.jid, { image: buf, caption: `🖼️ *Wallpaper:* ${query}` }, { quoted: ctx.message });
      }
    } catch (err) {
      await ctx.reply(`❌ Failed to fetch wallpaper: ${(err as Error).message}`);
    }
  },
};
