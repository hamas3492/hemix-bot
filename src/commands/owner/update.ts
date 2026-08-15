import { CommandContext } from '../types'; import { config } from '../../config';
export default {
  name: 'update', alias: ['updates'], category: 'Owner', description: 'Check for updates', usage: '.update', permission: 4, cooldown: 10,
  handler: async (ctx: CommandContext) => {
    await ctx.reply(`📦 *${config.botName} V${config.version}*\n\n✅ Current version: ${config.version}\n🔄 To update: git pull && npm install && npm run build\n\nNo update check available. Update manually via git.`);
  },
};
