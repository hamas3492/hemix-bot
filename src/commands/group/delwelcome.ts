import { CommandContext } from '../types'; import { db } from '../../database';
export default {
  name: 'delwelcome', alias: [], category: 'Group', description: 'Delete welcome config', usage: '.delwelcome', permission: 2, cooldown: 3,
  handler: async (ctx: CommandContext) => { db.setGroupSetting(ctx.jid, 'welcome_msg', ''); db.setGroupSetting(ctx.jid, 'welcome', 'false'); await ctx.reply('✅ Welcome config deleted!'); },
};
