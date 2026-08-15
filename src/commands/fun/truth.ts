import { CommandContext } from '../types';

export default {
  name: 'truth',
  alias: [],
  category: 'Fun',
  description: 'Get a truth question',
  usage: '.truth',
  permission: 1,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const truths = [
      'What is your biggest fear?',
      'What is the most embarrassing thing you have ever done?',
      'What is a secret you have never told anyone?',
      'Who is your biggest crush?',
      'What is the worst thing you have ever done?',
      'What is your most annoying habit?',
      'Have you ever lied to get out of trouble?',
      'What is the weirdest thing you have ever eaten?',
    ];
    await ctx.reply(`🤔 *Truth:*\n\n${truths[Math.floor(Math.random() * truths.length)]}`);
  },
};
