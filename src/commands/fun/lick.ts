import { CommandContext } from '../types';

export default {
  name: 'lick',
  alias: [],
  category: 'Fun',
  description: 'Lick someone playfully',
  usage: '.lick @user',
  permission: 1,
  cooldown: 5,
  handler: async (ctx: CommandContext) => {
    const target = ctx.args[0] || 'the screen';
    await ctx.reply(`👅 ${ctx.senderName} licked ${target}! 😋`);
  },
};
