import { CommandContext } from '../types';
import { db } from '../../database';
export default {
  name: 'listdisabled', alias: ['disabled'], category: 'Settings', description: 'List disabled features', usage: '.listdisabled', permission: 4, cooldown: 5,
  handler: async (ctx: CommandContext) => {
    const rows = db.query<{key: string, value: string}>('SELECT key, value FROM settings WHERE value = ?', ['false']);
    if (rows.length === 0) { await ctx.reply('📋 No disabled features!'); return; }
    let text = '❌ *Disabled Features:*\n\n';
    for (const row of rows) text += `• ${row.key}\n`;
    await ctx.reply(text);
  },
};
