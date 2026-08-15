import { CommandContext } from '../types';
import axios from 'axios';

export default {
  name: 'memes',
  alias: ['meme', 'randommeme'],
  category: 'tools',
  description: 'Get a random funny meme from Reddit',
  usage: 'memes',
  permission: 0,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    try {
      const res = await axios.get('https://meme-api.com/gimme', { timeout: 8000 });
      const data = res.data;

      if (data && data.url) {
        const caption = `😂 *${data.title}*\n👤 Subreddit: r/${data.subreddit} | 👍 ${data.ups} upvotes`;
        const imgRes = await axios.get(data.url, { responseType: 'arraybuffer', timeout: 10000 });
        const buf = Buffer.from(imgRes.data);

        if (ctx.replyMedia) {
          await ctx.replyMedia(buf, 'image/jpeg', caption);
        } else {
          await ctx.client.sendMessage(ctx.jid, { image: buf, caption }, { quoted: ctx.message });
        }
        return;
      }
    } catch (e) {}

    await ctx.reply('🤣 *Random Meme:* Why do programmers prefer dark mode? Because light attracts bugs!');
  },
};
