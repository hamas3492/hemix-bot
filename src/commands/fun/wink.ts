import { CommandContext } from '../types';

export default {
  name: 'wink',
  alias: [],
  category: 'Fun',
  description: 'Wink at someone',
  usage: '.wink @user',
  permission: 1,
  cooldown: 5,
  handler: async (ctx: CommandContext) => {
    const target = ctx.args[0] || 'everyone';
    await ctx.reply(`😉 ${ctx.senderName} winked at ${target}! 😎`);
  },
};
