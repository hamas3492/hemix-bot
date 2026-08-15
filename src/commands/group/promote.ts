import { CommandContext } from '../types';
export default {
  name: 'promote', alias: ['prom'], category: 'Group', description: 'Promote member to admin', usage: '.promote @user', permission: 2, cooldown: 5,
  handler: async (ctx: CommandContext) => {
    if (!ctx.isGroup) { await ctx.reply('❌ Group only!'); return; }
    const target = ctx.args[0]?.replace(/[@!]/g, '') || ctx.quoted?.key?.participant;
    if (!target) { await ctx.reply('Usage: .promote @user'); return; }
    try {
      const jid = target.includes('@') ? target : `${target}@s.whatsapp.net`;
      await ctx.client.groupParticipantsUpdate(ctx.jid, [jid], 'promote');
      await ctx.reply(`✅ Promoted @${target} to admin!`);
    } catch (err: any) { await ctx.reply(`❌ Error: ${err.message}`); }
  },
};
