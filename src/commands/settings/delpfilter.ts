import { CommandContext } from '../types'; import { db } from '../../database';
export default {
  name: 'delpfilter', alias: ['delpf'], category: 'Settings', description: 'Delete private filter', usage: '.delpfilter <id>', permission: 4, cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const id = parseInt(ctx.args[0]); if (!id) { await ctx.reply('Usage: .delpfilter <id>'); return; }
    db.deleteFilter(id); await ctx.reply('✅ Filter deleted!');
  },
};
