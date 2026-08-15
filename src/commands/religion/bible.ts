import { CommandContext } from '../types';
import axios from 'axios';

export default {
  name: 'bible',
  alias: ['bibleverse'],
  category: 'Religion',
  description: 'Get a Bible verse',
  usage: '.bible <book chapter:verse> or .bible for random',
  permission: 1,
  cooldown: 5,
  handler: async (ctx: CommandContext) => {
    try {
      let url = 'https://bible-api.com/?random=verse';
      if (ctx.text) {
        url = `https://bible-api.com/${encodeURIComponent(ctx.text)}?translation=kjv`;
      }
      const res = await axios.get(url, { timeout: 10000 });
      if (res.data) {
        const { reference, text, translation_name } = res.data;
        await ctx.reply(`📖 *Bible Verse*\n\n*${reference}*\n\n${text.trim()}\n\n— ${translation_name}`);
      } else { await ctx.reply('❌ Verse not found!'); }
    } catch (err: any) { await ctx.reply(`❌ Error: ${err.message}`); }
  },
};
