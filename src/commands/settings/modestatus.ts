import { CommandContext } from '../types'; import { config } from '../../config';
export default {
  name: 'modestatus', alias: ['ms'], category: 'Settings', description: 'Show current mode', usage: '.modestatus', permission: 1, cooldown: 3,
  handler: async (ctx: CommandContext) => { await ctx.reply(`📋 Current Mode: *${config.botMode}*`); },
};
