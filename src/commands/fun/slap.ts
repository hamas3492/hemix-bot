import { CommandContext } from '../types';

export default {
  name: 'slap',
  alias: ['smack'],
  category: 'Fun',
  description: 'Slap someone playfully',
  usage: '.slap @user',
  permission: 1,
  cooldown: 5,
  handler: async (ctx: CommandContext) => {
    const target = ctx.args[0] || 'the air';
    const items = ['a fish', 'a taco', 'a rubber chicken', 'a pillow', 'a pizza slice'];
    const item = items[Math.floor(Math.random() * items.length)];
    await ctx.reply(`👋 ${ctx.senderName} slapped ${target} with ${item}! 💥`);
  },
};
