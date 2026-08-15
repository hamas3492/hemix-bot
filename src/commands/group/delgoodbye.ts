import { CommandContext } from '../types'; import { db } from '../../database';
export default {
  name: 'delgoodbye', alias: [], category: 'Group', description: 'Delete goodbye config', usage: '.delgoodbye', permission: 2, cooldown: 3,
  handler: async (ctx: CommandContext) => { db.setGroupSetting(ctx.jid, 'goodbye_msg', ''); db.setGroupSetting(ctx.jid, 'goodbye', 'false'); await ctx.reply('✅ Goodbye config deleted!'); },
};
