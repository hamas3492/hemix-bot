import { CommandContext } from '../types'; import { db } from '../../database';
export default {
  name: 'unblock', alias: ['ub'], category: 'Owner', description: 'Unblock a user', usage: '.unblock <number>', permission: 4, cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const num = ctx.args[0]?.replace(/[^0-9]/g, ''); if (!num) { await ctx.reply('Usage: .unblock <number>'); return; }
    const jid = num.includes('@') ? num : `${num}@s.whatsapp.net`;
    db.unblockUser(jid);
    try { await ctx.client.updateBlockStatus(jid, 'unblock'); } catch {}
    await ctx.reply(`✅ Unblocked @${num}!`);
  },
};
