import { CommandContext } from '../types'; import { db } from '../../database';
export default {
  name: 'setwelcome', alias: ['setwel'], category: 'Group', description: 'Set welcome message', usage: '.setwelcome <text>', permission: 2, cooldown: 3,
  handler: async (ctx: CommandContext) => {
    if (!ctx.isGroup || !ctx.text) { await ctx.reply('Usage: .setwelcome <text>\nVariables: {user} {group} {count}'); return; }
    db.setGroupSetting(ctx.jid, 'welcome_msg', ctx.text);
    await ctx.reply('✅ Welcome message updated! Use {user}, {group}, {count} for variables.');
  },
};
