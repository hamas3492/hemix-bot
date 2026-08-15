import { CommandContext } from '../types';
import axios from 'axios';

export default {
  name: 'define',
  alias: ['definition', 'dict'],
  category: 'Search',
  description: 'Get word definition',
  usage: '.define <word>',
  permission: 1,
  cooldown: 5,
  handler: async (ctx: CommandContext) => {
    if (!ctx.text) { await ctx.reply('📚 Please provide a word!'); return; }
    try {
      const res = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${ctx.text}`, { timeout: 10000 });
      if (res.data?.[0]) {
        const word = res.data[0];
        const meaning = word.meanings?.[0];
        const def = meaning?.definitions?.[0];
        let text = `📚 *${word.word}*\n\n`;
        if (meaning?.partOfSpeech) text += `*Part of speech:* ${meaning.partOfSpeech}\n`;
        if (def?.definition) text += `*Definition:* ${def.definition}\n`;
        if (def?.example) text += `*Example:* "${def.example}"\n`;
        if (word.phonetics?.[0]?.text) text += `*Pronunciation:* ${word.phonetics[0].text}\n`;
        await ctx.reply(text);
      } else { await ctx.reply('❌ Word not found!'); }
    } catch (err: any) { await ctx.reply(`❌ Error: ${err.message}`); }
  },
};
