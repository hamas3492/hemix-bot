import { CommandContext } from '../types'; import { db } from '../../database';
export default {
  name: 'warn', alias: ['warning'], category: 'Settings', description: 'Warn a user', usage: '.warn @user <reason>', permission: 2, cooldown: 5,
  handler: async (ctx: CommandContext) => {
    const target = ctx.args[0]?.replace('@', '') || ctx.quoted?.key?.participant;
    if (!target) { await ctx.reply('Usage: .warn @user <reason>'); return; }
    const groupId = ctx.isGroup ? ctx.jid : 'private';
    const count = db.addWarning(target.includes('@') ? target : `${target}@s.whatsapp.net`, groupId);
    await ctx.reply(`⚠️ Warning #${count} for @${target.replace('@s.whatsapp.net', '')}!\nReason: ${ctx.args.slice(1).join(' ') || 'No reason provided'}`);
  },
};
