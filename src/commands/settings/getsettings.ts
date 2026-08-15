import { CommandContext } from '../types';
import { config } from '../../config';
export default {
  name: 'getsettings', alias: ['settings', 'gs'], category: 'Settings', description: 'Get current settings', usage: '.getsettings', permission: 4, cooldown: 5,
  handler: async (ctx: CommandContext) => {
    let text = `⚙️ *Bot Settings*\n\n📝 Bot Name: ${config.botName}\n👤 Owner: ${config.ownerName}\n🔤 Prefix: ${config.botPrefix}\n📋 Mode: ${config.botMode}\n⏰ Timezone: ${config.timezone}\n📦 Version: ${config.version}`;
    await ctx.reply(text);
  },
};
