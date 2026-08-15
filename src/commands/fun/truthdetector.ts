import { CommandContext } from '../types';

export default {
  name: 'truthdetector',
  alias: ['td', 'lie'],
  category: 'Fun',
  description: 'Truth detector (random result)',
  usage: '.truthdetector <statement>',
  permission: 1,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const statement = ctx.text || 'your statement';
    const results = [
      '✅ TRUE - This person is telling the truth!',
      '❌ FALSE - This is a lie!',
      '🤔 UNCERTAIN - The truth detector is confused...',
      '⚠️ MAYBE - Hard to tell on this one...',
    ];
    const result = results[Math.floor(Math.random() * results.length)];
    await ctx.reply(`🔍 *Truth Detector*\n\nStatement: "${statement}"\n\nResult: ${result}`);
  },
};
