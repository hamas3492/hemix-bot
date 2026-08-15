import { CommandContext } from '../types'; import { db } from '../../database';
export default {
  name: 'unblockall', alias: [], category: 'Owner', description: 'Unblock all users', usage: '.unblockall', permission: 4, cooldown: 5,
  handler: async (ctx: CommandContext) => {
    const blocked = db.getBlockedUsers();
    for (const jid of blocked) { db.unblockUser(jid); try { await ctx.client.updateBlockStatus(jid, 'unblock'); } catch {} }
    await ctx.reply(`✅ Unblocked ${blocked.length} users!`);
  },
};
