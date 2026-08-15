import { CommandContext } from '../types';
import axios from 'axios';

export default {
  name: 'trivia',
  alias: ['quiz'],
  category: 'Translate',
  description: 'Random trivia question',
  usage: '.trivia',
  permission: 1,
  cooldown: 5,
  handler: async (ctx: CommandContext) => {
    try {
      const res = await axios.get('https://opentdb.com/api.php?amount=1&type=multiple', { timeout: 10000 });
      if (res.data?.results?.[0]) {
        const q = res.data.results[0];
        let text = `🧠 *Trivia Question*\n\n📋 Category: ${q.category}\n📊 Difficulty: ${q.difficulty}\n\n❓ ${q.question}\n\n`;
        const options = [...q.incorrect_answers, q.correct_answer];
        options.sort(() => Math.random() - 0.5);
        for (let i = 0; i < options.length; i++) {
          text += `${String.fromCharCode(65 + i)}. ${options[i]}\n`;
        }
        text += `\n💡 Answer: ${q.correct_answer}`;
        await ctx.reply(text);
      }
    } catch (err: any) { await ctx.reply(`❌ Error: ${err.message}`); }
  },
};
