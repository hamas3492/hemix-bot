import { CommandContext } from '../types';

export default {
  name: 'truthordare',
  alias: ['tod'],
  category: 'Fun',
  description: 'Play truth or dare',
  usage: '.truthordare',
  permission: 1,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const truths = [
      'What is your biggest fear?',
      'What is the most embarrassing thing you have done?',
      'What is a secret you never told anyone?',
    ];
    const dares = [
      'Send a funny voice note!',
      'Change your profile picture to a meme!',
      'Send "I love you" to the last person you texted!',
      'Do 10 pushups and send a video!',
    ];
    const choice = Math.random() > 0.5 ? 'truth' : 'dare';
    const item = choice === 'truth' ? truths[Math.floor(Math.random() * truths.length)] : dares[Math.floor(Math.random() * dares.length)];
    await ctx.reply(`🎲 *Truth or Dare*\n\nYou got: **${choice.toUpperCase()}**\n\n${item}`);
  },
};
