import { CommandContext } from '../types';
import axios from 'axios';

export default {
  name: 'define2',
  alias: ['wiktionary'],
  category: 'Search',
  description: 'Alternative word definition (Wiktionary)',
  usage: '.define2 <word>',
  permission: 1,
  cooldown: 5,
  handler: async (ctx: CommandContext) => {
    if (!ctx.text) { await ctx.reply('📚 Please provide a word!'); return; }
    try {
      const res = await axios.get(`https://en.wiktionary.org/api/rest_v1/page/definition/${ctx.text}`, { timeout: 10000 });
      if (res.data) {
        const lang = Object.keys(res.data)[0];
        const defs = res.data[lang];
        if (defs?.[0]) {
          let text = `📚 *${ctx.text}* (${lang})\n\n`;
          for (const d of defs.slice(0, 3)) {
            text += `• ${d.meanings?.[0]?.definition || 'N/A'}\n`;
          }
          await ctx.reply(text);
        } else { await ctx.reply('❌ No definitions found!'); }
      }
    } catch (err: any) { await ctx.reply(`❌ Error: ${err.message}`); }
  },
};
