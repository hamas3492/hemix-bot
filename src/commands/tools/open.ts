import { CommandContext } from '../types';

export default {
  name: 'open',
  alias: ['opengroup', 'unlockgroup'],
  category: 'tools',
  description: 'Open group chat so all participants can send messages (Group Admin only)',
  usage: 'open',
  permission: 2,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    if (!ctx.isGroup) {
      return await ctx.reply('⚠️ This command can only be used in a group chat.');
    }

    try {
      await ctx.client.groupSettingUpdate(ctx.jid, 'not_announcement');
      await ctx.reply('🔓 *Group has been opened! All participants can now send messages.*');
    } catch (err) {
      await ctx.reply(`❌ Failed to open group: ${(err as Error).message}`);
    }
  },
};
