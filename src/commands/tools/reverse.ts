import { CommandContext } from '../types';

export default {
  name: 'reverse',
  alias: ['reversetext'],
  category: 'tools',
  description: 'Reverse text characters or words',
  usage: 'reverse <text>',
  permission: 0,
  cooldown: 2,
  handler: async (ctx: CommandContext) => {
    const input = ctx.text || ctx.args.join(' ') || ctx.quoted?.message?.conversation;
    if (!input) {
      return await ctx.reply('⚠️ Please provide text or reply to a message to reverse.');
    }

    const reversedChar = input.split('').reverse().join('');
    const reversedWords = input.split(/\s+/).reverse().join(' ');

    await ctx.reply(`🔄 *REVERSED TEXT*\n\n🔤 *Character Reverse:* ${reversedChar}\n🔠 *Word Reverse:* ${reversedWords}`);
  },
};
