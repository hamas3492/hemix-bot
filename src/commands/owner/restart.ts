import { CommandContext } from '../types';
export default {
  name: 'restart', alias: ['r'], category: 'Owner', description: 'Restart bot process', usage: '.restart', permission: 4, cooldown: 10,
  handler: async (ctx: CommandContext) => {
    await ctx.reply('🔄 Restarting bot...');
    setTimeout(() => process.exit(0), 2000);
  },
};
