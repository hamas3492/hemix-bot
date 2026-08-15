import { CommandContext } from '../types';
export default {
  name: 'getid', alias: ['id'], category: 'Settings', description: 'Get chat ID', usage: '.getid', permission: 1, cooldown: 3,
  handler: async (ctx: CommandContext) => {
    await ctx.reply(`🆔 Chat ID: \`${ctx.jid}\`\n👤 Sender: \`${ctx.sender}\``);
  },
};
