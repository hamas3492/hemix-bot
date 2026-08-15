import { CommandContext } from '../types'; import { db } from '../../database';
export default {
  name: 'delgfilter', alias: ['delfilter'], category: 'Settings', description: 'Delete group filter', usage: '.delgfilter <id>', permission: 2, cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const id = parseInt(ctx.args[0]); if (!id) { await ctx.reply('Usage: .delgfilter <id>'); return; }
    db.deleteFilter(id); await ctx.reply('✅ Filter deleted!');
  },
};
