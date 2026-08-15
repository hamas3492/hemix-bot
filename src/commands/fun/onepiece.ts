import { CommandContext } from '../types';

export default {
  name: 'onepiece',
  alias: ['op', 'luffy'],
  category: 'fun',
  description: 'One Piece themed response',
  usage: '.onepiece',
  permission: 1,
  cooldown: 5,
  handler: async (ctx: CommandContext) => {
    const quotes = [
      '🏴‍☠️ "I\'m gonna be King of the Pirates!" - Luffy',
      '🏴‍☠️ "When do you think people die?" - Dr. Hiluluk',
      '🏴‍☠️ "I don\'t want to conquer anything. I just think the guy with the most freedom in this whole ocean is the Pirate King!" - Luffy',
      '🏴‍☠️ "If you don\'t take risks, you can\'t create a future!" - Luffy',
    ];
    await ctx.reply(quotes[Math.floor(Math.random() * quotes.length)]);
  },
};
