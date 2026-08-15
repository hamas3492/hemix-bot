import { CommandContext } from '../types';
import { db } from '../../database';
export default {
  name: 'listactive', alias: ['active'], category: 'Settings', description: 'List active features', usage: '.listactive', permission: 4, cooldown: 5,
  handler: async (ctx: CommandContext) => {
    const rows = db.query<{key: string, value: string}>('SELECT key, value FROM settings WHERE value = ?', ['true']);
    if (rows.length === 0) { await ctx.reply('📋 No active features!'); return; }
    let text = '✅ *Active Features:*\n\n';
    for (const row of rows) text += `• ${row.key}\n`;
    await ctx.reply(text);
  },
};
