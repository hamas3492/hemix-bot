import { CommandContext } from '../types';
import { config } from '../../config';
export default {
  name: 'getabout', alias: ['about'], category: 'Settings', description: 'Get bot about/info', usage: '.getabout', permission: 1, cooldown: 3,
  handler: async (ctx: CommandContext) => {
    await ctx.reply(`🤖 *${config.botName}* V${config.version}\n📋 Mode: ${config.botMode}\n🔤 Prefix: ${config.botPrefix}\n👤 Owner: ${config.ownerName}\n⏰ Timezone: ${config.timezone}`);
  },
};
