import { CommandContext } from '../types'; import { db } from '../../database';
export default {
  name: 'gfilter', alias: ['gf'], category: 'Settings', description: 'Group filter', usage: '.gfilter <pattern> <response>', permission: 2, cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const pattern = ctx.args[0]; const response = ctx.args.slice(1).join(' ');
    if (!pattern || !response) { await ctx.reply('Usage: .gfilter <pattern> <response>'); return; }
    db.addFilter(ctx.jid, 'group', pattern, response); await ctx.reply(`✅ Filter added: ${pattern} → ${response}`);
  },
};
