import { CommandContext } from '../types';

export default {
  name: 'sand',
  alias: ['sandtext'],
  category: 'Fun',
  description: 'Sand text art',
  usage: '.sand <text>',
  permission: 1,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const text = ctx.text || 'Hemix';
    const sand = text.split('').map(c => {
      if (c === ' ') return '  ';
      return `🏖️${c}`;
    }).join('');
    await ctx.reply(`🏖️ Sand Writing:\n\n${sand}`);
  },
};
