import { CommandContext } from '../types';
export default {
  name: 'setgroupname', alias: ['setname'], category: 'Owner', description: 'Set group name', usage: '.setgroupname <name>', permission: 2, cooldown: 5,
  handler: async (ctx: CommandContext) => {
    if (!ctx.isGroup || !ctx.text) { await ctx.reply('Usage: .setgroupname <name>'); return; }
    try { await ctx.client.groupUpdateSubject(ctx.jid, ctx.text); await ctx.reply('✅ Group name updated!'); } catch (err: any) { await ctx.reply(`❌ Error: ${err.message}`); }
  },
};
