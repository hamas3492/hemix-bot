import { CommandContext } from '../types';
export default {
  name: 'kick', alias: ['k'], category: 'Group', description: 'Kick user from group', usage: '.kick @user', permission: 2, cooldown: 5,
  handler: async (ctx: CommandContext) => {
    if (!ctx.isGroup) { await ctx.reply('❌ Group only!'); return; }
    const target = ctx.args[0]?.replace(/[@!]/g, '') || ctx.quoted?.key?.participant;
    if (!target) { await ctx.reply('Usage: .kick @user'); return; }
    try {
      const jid = target.includes('@') ? target : `${target}@s.whatsapp.net`;
      await ctx.client.groupParticipantsUpdate(ctx.jid, [jid], 'remove');
      await ctx.reply(`✅ Kicked @${target}!`);
    } catch (err: any) { await ctx.reply(`❌ Error: ${err.message}`); }
  },
};
