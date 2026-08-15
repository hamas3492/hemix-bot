import { CommandContext } from '../types'; import { db } from '../../database';
export default {
  name: 'setgoodbye', alias: ['setbye'], category: 'Group', description: 'Set goodbye message', usage: '.setgoodbye <text>', permission: 2, cooldown: 3,
  handler: async (ctx: CommandContext) => {
    if (!ctx.isGroup || !ctx.text) { await ctx.reply('Usage: .setgoodbye <text>\nVariables: {user} {group}'); return; }
    db.setGroupSetting(ctx.jid, 'goodbye_msg', ctx.text);
    await ctx.reply('✅ Goodbye message updated!');
  },
};
