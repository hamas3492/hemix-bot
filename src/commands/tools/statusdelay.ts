import { CommandContext } from '../types';

export default {
  name: 'statusdelay',
  alias: ['setstatusdelay'],
  category: 'tools',
  description: 'Set status viewing delay timer in seconds',
  usage: 'statusdelay <seconds>',
  permission: 0,
  cooldown: 2,
  handler: async (ctx: CommandContext) => {
    const seconds = parseInt(ctx.args[0] || '0', 10);
    if (isNaN(seconds) || seconds < 0) {
      return await ctx.reply('⚠️ Please provide a valid delay in seconds (e.g. `statusdelay 5`)');
    }

    ctx.db.setPlugin('status_delay', true, String(seconds));
    await ctx.reply(`⏱️ *Status delay set to ${seconds} second(s).*`);
  },
};
