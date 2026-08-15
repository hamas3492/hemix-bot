import { CommandContext } from '../types';
import axios from 'axios';

export default {
  name: 'tinyurl',
  alias: ['shorten', 'shorturl'],
  category: 'tools',
  description: 'Shorten URL using TinyURL',
  usage: 'tinyurl <URL>',
  permission: 0,
  cooldown: 2,
  handler: async (ctx: CommandContext) => {
    let url = ctx.args[0] || ctx.text;
    if (!url) {
      return await ctx.reply('⚠️ Please provide a URL to shorten.');
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    try {
      const res = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`, { timeout: 6000 });
      await ctx.reply(`🔗 *SHORTENED URL*\n\nOriginal: ${url}\nShort: ${res.data}`);
    } catch (err) {
      await ctx.reply(`❌ URL shortening failed: ${(err as Error).message}`);
    }
  },
};
