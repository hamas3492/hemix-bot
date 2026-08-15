import { CommandContext } from '../types';
import axios from 'axios';

export default {
  name: 'quran',
  alias: ['quranverse', 'ayat'],
  category: 'Religion',
  description: 'Get a Quran verse',
  usage: '.quran <surah:ayah> or .quran for random',
  permission: 1,
  cooldown: 5,
  handler: async (ctx: CommandContext) => {
    try {
      if (ctx.text) {
        const [surah, ayah] = ctx.text.split(':');
        const res = await axios.get(`https://api.quran.com/v4/quran/verses/by_key/${surah}:${ayah}?language=en&words=true&translations=131`, { timeout: 10000 });
        if (res.data?.verse) {
          const v = res.data.verse;
          await ctx.reply(`🕌 *Quran ${surah}:${ayah}*\n\n${v.translations?.[0]?.text || 'Translation unavailable'}\n\n— Sahih International`);
        }
      } else {
        const res = await axios.get('https://api.quran.com/v4/quran/verses/random?language=en&words=true&translations=131', { timeout: 10000 });
        if (res.data?.verse) {
          const v = res.data.verse;
          await ctx.reply(`🕌 *Quran ${v.verse_key}*\n\n${v.translations?.[0]?.text || 'Translation unavailable'}\n\n— Sahih International`);
        }
      }
    } catch (err: any) { await ctx.reply(`❌ Error: ${err.message}`); }
  },
};
