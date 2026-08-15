import { CommandContext } from '../types';

export default {
  name: 'kill',
  alias: ['murder'],
  category: 'Fun',
  description: 'Playfully kill someone',
  usage: '.kill @user',
  permission: 1,
  cooldown: 5,
  handler: async (ctx: CommandContext) => {
    const target = ctx.args[0] || 'someone';
    const ways = [
      `🔪 ${ctx.senderName} killed ${target} with a knife!`,
      `☠️ ${ctx.senderName} poisoned ${target}'s tea!`,
      `💥 ${ctx.senderName} eliminated ${target} with a headshot!`,
      `⚡ ${ctx.senderName} struck ${target} with lightning!`,
    ];
    await ctx.reply(ways[Math.floor(Math.random() * ways.length)]);
  },
};
