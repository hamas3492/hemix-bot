import { CommandContext } from '../types';
export default {
  name: 'getgrouppp', alias: ['grouppp'], category: 'Settings', description: 'Get group profile picture', usage: '.getgrouppp', permission: 2, cooldown: 5,
  handler: async (ctx: CommandContext) => {
    if (!ctx.isGroup) { await ctx.reply('❌ This command only works in groups!'); return; }
    try {
      const ppUrl = await ctx.client.profilePictureUrl(ctx.jid, 'image');
      await ctx.reply(`🖼️ Group PP: ${ppUrl}`);
    } catch { await ctx.reply('❌ No profile picture found!'); }
  },
};
