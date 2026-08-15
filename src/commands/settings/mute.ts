import { CommandContext } from '../types'; import { db } from '../../database';
export default {
  name: 'mute', alias: [], category: 'Settings', description: 'Mute chat', usage: '.mute', permission: 2, cooldown: 3,
  handler: async (ctx: CommandContext) => { db.setGroupSetting(ctx.jid, 'mute', 'true'); await ctx.reply('🔇 Chat muted!'); },
};
