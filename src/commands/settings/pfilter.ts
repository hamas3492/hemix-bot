import { CommandContext } from '../types'; import { db } from '../../database';
export default {
  name: 'pfilter', alias: ['pf'], category: 'Settings', description: 'Private filter', usage: '.pfilter <pattern> <response>', permission: 4, cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const pattern = ctx.args[0]; const response = ctx.args.slice(1).join(' ');
    if (!pattern || !response) { await ctx.reply('Usage: .pfilter <pattern> <response>'); return; }
    db.addFilter(ctx.jid, 'private', pattern, response); await ctx.reply(`✅ Filter added: ${pattern} → ${response}`);
  },
};
