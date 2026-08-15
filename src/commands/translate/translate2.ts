import { CommandContext } from '../types';
import axios from 'axios';

export default {
  name: 'translate2',
  alias: ['tr2', 'trans2'],
  category: 'Translate',
  description: 'Alternative translate (Google)',
  usage: '.translate2 <lang> <text>',
  permission: 1,
  cooldown: 5,
  handler: async (ctx: CommandContext) => {
    if (!ctx.text) { await ctx.reply('🌐 Usage: .translate2 <lang_code> <text>'); return; }
    const parts = ctx.text.split(' ');
    const lang = parts[0];
    const text = parts.slice(1).join(' ');
    if (!lang || !text) { await ctx.reply('❌ Please provide language code and text!'); return; }
    try {
      const res = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(text)}`, { timeout: 10000 });
      if (res.data?.[0]) {
        const translated = res.data[0].map((item: any) => item[0]).join('');
        await ctx.reply(`🌐 *Translated to ${lang}:*\n\n${translated}`);
      } else { await ctx.reply('❌ Translation failed!'); }
    } catch (err: any) { await ctx.reply(`❌ Error: ${err.message}`); }
  },
};
