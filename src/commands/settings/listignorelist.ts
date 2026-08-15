import { CommandContext } from '../types';
import { db } from '../../database';
export default {
  name: '${cmd}', alias: [], category: 'Settings', description: 'List items', usage: '.${cmd}', permission: 4, cooldown: 5,
  handler: async (ctx: CommandContext) => {
    const rows = db.query('SELECT * FROM group_settings WHERE group_id = ?', [ctx.jid]);
    if (rows.length === 0) { await ctx.reply('📋 No items found!'); return; }
    let text = '📋 *Items:*\n\n';
    for (const row of rows as any[]) text += `• ${row.key}: ${row.value}\n`;
    await ctx.reply(text);
  },
};
