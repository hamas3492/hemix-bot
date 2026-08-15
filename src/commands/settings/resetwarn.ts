import { CommandContext } from '../types'; import { db } from '../../database';
export default {
  name: 'resetwarn', alias: ['rwarn'], category: 'Settings', description: 'Reset warnings', usage: '.resetwarn @user', permission: 2, cooldown: 5,
  handler: async (ctx: CommandContext) => {
    const target = ctx.args[0]?.replace('@', '') || '';
    if (!target) { await ctx.reply('Usage: .resetwarn @user'); return; }
    const groupId = ctx.isGroup ? ctx.jid : 'private';
    db.resetWarnings(target.includes('@') ? target : `${target}@s.whatsapp.net`, groupId);
    await ctx.reply(`✅ Warnings reset for ${target}!`);
  },
};
