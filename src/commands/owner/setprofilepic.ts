import { CommandContext } from '../types';
export default {
  name: 'setprofilepic', alias: ['setpp'], category: 'Owner', description: 'Set bot profile picture', usage: '.setprofilepic (reply to image)', permission: 4, cooldown: 5,
  handler: async (ctx: CommandContext) => {
    if (!ctx.quoted?.message?.imageMessage) { await ctx.reply('📷 Reply to an image!'); return; }
    try {
      const stream = await ctx.client.downloadMediaMessage({ message: ctx.quoted.message });
      await ctx.client.updateProfilePicture(ctx.client.user?.id, stream);
      await ctx.reply('✅ Profile picture updated!');
    } catch (err: any) { await ctx.reply(`❌ Error: ${err.message}`); }
  },
};
