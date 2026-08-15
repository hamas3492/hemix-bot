import { CommandContext } from '../types'; import { db } from '../../database';
export default {
  name: 'unmute', alias: [], category: 'Settings', description: 'Unmute chat', usage: '.unmute', permission: 2, cooldown: 3,
  handler: async (ctx: CommandContext) => { db.setGroupSetting(ctx.jid, 'mute', 'false'); await ctx.reply('🔊 Chat unmuted!'); },
};
