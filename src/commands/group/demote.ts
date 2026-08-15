import { CommandContext } from '../types';
export default {
  name: 'demote', alias: ['dem'], category: 'Group', description: 'Demote admin to member', usage: '.demote @user', permission: 2, cooldown: 5,
  handler: async (ctx: CommandContext) => {
    if (!ctx.isGroup) { await ctx.reply('❌ Group only!'); return; }
    const target = ctx.args[0]?.replace(/[@!]/g, '') || ctx.quoted?.key?.participant;
    if (!target) { await ctx.reply('Usage: .demote @user'); return; }
    try {
      const jid = target.includes('@') ? target : `${target}@s.whatsapp.net`;
      await ctx.client.groupParticipantsUpdate(ctx.jid, [jid], 'demote');
      await ctx.reply(`✅ Demoted @${target}!`);
    } catch (err: any) { await ctx.reply(`❌ Error: ${err.message}`); }
  },
};
