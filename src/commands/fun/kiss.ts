import { CommandContext } from '../types';

export default {
  name: 'kiss',
  alias: [],
  category: 'Fun',
  description: 'Kiss someone playfully',
  usage: '.kiss @user',
  permission: 1,
  cooldown: 5,
  handler: async (ctx: CommandContext) => {
    const target = ctx.args[0] || 'the air';
    await ctx.reply(`💋 ${ctx.senderName} kissed ${target}! 😘`);
  },
};
