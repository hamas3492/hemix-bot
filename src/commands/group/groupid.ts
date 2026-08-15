import { CommandContext } from '../types';
export default {
  name: 'groupid', alias: ['gid'], category: 'Group', description: 'Get group ID', usage: '.groupid', permission: 1, cooldown: 3,
  handler: async (ctx: CommandContext) => {
    if (!ctx.isGroup) { await ctx.reply('❌ Group only!'); return; }
    await ctx.reply(`🆔 Group ID: \`${ctx.jid}\``);
  },
};
