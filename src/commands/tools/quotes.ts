import { CommandContext } from '../types';
import axios from 'axios';

export default {
  name: 'quotes',
  alias: ['quote', 'inspire'],
  category: 'tools',
  description: 'Get a random inspirational quote',
  usage: 'quotes',
  permission: 0,
  cooldown: 2,
  handler: async (ctx: CommandContext) => {
    try {
      const res = await axios.get('https://api.quotable.io/random', { timeout: 6000 });
      if (res.data && res.data.content) {
        return await ctx.reply(`💬 *INSPIRATIONAL QUOTE*\n\n"${res.data.content}"\n\n— *${res.data.author || 'Anonymous'}*`);
      }
    } catch (e) {}

    const fallbackQuotes = [
      { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
      { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
      { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
    ];
    const q = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
    await ctx.reply(`💬 *INSPIRATIONAL QUOTE*\n\n"${q.text}"\n\n— *${q.author}*`);
  },
};
