import { CommandContext } from '../types'; import { db } from '../../database';
export default {
  name: 'showgoodbye', alias: [], category: 'Group', description: 'Show goodbye config', usage: '.showgoodbye', permission: 2, cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const enabled = db.getGroupSetting(ctx.jid, 'goodbye') === 'true';
    const msg = db.getGroupSetting(ctx.jid, 'goodbye_msg') || '👋 Goodbye @user!';
    await ctx.reply(`Goodbye Messages: ${enabled ? '✅ ON' : '❌ OFF'}\nMessage: ${msg}`);
  },
};
