import { CommandContext } from '../types';
export default {
  name: 'invite', alias: ['link', 'invitelink'], category: 'Group', description: 'Get group invite link', usage: '.invite', permission: 2, cooldown: 5,
  handler: async (ctx: CommandContext) => {
    if (!ctx.isGroup) { await ctx.reply('❌ Group only!'); return; }
    try {
      const code = await ctx.client.groupInviteCode(ctx.jid);
      await ctx.reply(`🔗 *Group Link:*\nhttps://chat.whatsapp.com/${code}`);
    } catch (err: any) { await ctx.reply(`❌ Error: ${err.message}`); }
  },
};
