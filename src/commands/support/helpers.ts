import { CommandContext } from '../types';

export default {
  name: 'helpers',
  alias: ['help', 'support'],
  category: 'Support',
  description: 'Show help and support info',
  usage: '.help',
  permission: 1,
  cooldown: 5,
  handler: async (ctx: CommandContext) => {
    const text = `🤖 *${ctx.config.botName} Help*\n\n📋 Commands: Use .menu to see all commands\n🔧 Prefix: ${ctx.config.botPrefix}\n📜 Categories: .categories\n📊 Status: .botinfo\n\n💬 Need help with a command? Type: .list <category>\n📨 Found a bug? Use: .feedback <message>`;
    await ctx.reply(text);
  },
};
