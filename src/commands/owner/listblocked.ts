import { CommandContext } from '../types'; import { db } from '../../database';
export default {
  name: 'listblocked', alias: ['blockedusers'], category: 'Owner', description: 'List blocked users', usage: '.listblocked', permission: 4, cooldown: 5,
  handler: async (ctx: CommandContext) => {
    const blocked = db.getBlockedUsers();
    if (blocked.length === 0) { await ctx.reply('📋 No blocked users!'); return; }
    let text = '🚫 *Blocked Users:*\n\n';
    for (const jid of blocked) text += `• @${jid.split('@')[0]}\n`;
    await ctx.reply(text);
  },
};
