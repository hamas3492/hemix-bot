import { CommandContext } from '../types'; import { db } from '../../database';
export default {
  name: 'showwelcome', alias: [], category: 'Group', description: 'Show welcome config', usage: '.showwelcome', permission: 2, cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const enabled = db.getGroupSetting(ctx.jid, 'welcome') === 'true';
    const msg = db.getGroupSetting(ctx.jid, 'welcome_msg') || '👋 Welcome @user!';
    await ctx.reply(`Welcome Messages: ${enabled ? '✅ ON' : '❌ OFF'}\nMessage: ${msg}`);
  },
};
