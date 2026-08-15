import { CommandContext } from '../types';
export default {
  name: 'setppgroup', alias: ['setgcpp'], category: 'Group', description: 'Set group profile picture', usage: '.setppgroup (reply to image)', permission: 2, cooldown: 5,
  handler: async (ctx: CommandContext) => {
    if (!ctx.isGroup) { await ctx.reply('❌ Group only!'); return; }
    if (!ctx.quoted?.message?.imageMessage) { await ctx.reply('📷 Reply to an image!'); return; }
    try {
      const stream = await ctx.client.downloadMediaMessage({ message: ctx.quoted.message });
      await ctx.client.updateProfilePicture(ctx.jid, stream);
      await ctx.reply('✅ Group profile picture updated!');
    } catch (err: any) { await ctx.reply(`❌ Error: ${err.message}`); }
  },
};
