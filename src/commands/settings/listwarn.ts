import { CommandContext } from '../types';
import { db } from '../../database';
export default {
  name: 'listwarn', alias: ['warnings'], category: 'Settings', description: 'List warnings', usage: '.listwarn', permission: 2, cooldown: 5,
  handler: async (ctx: CommandContext) => {
    const rows = db.query('SELECT user_id, group_id, count FROM warnings');
    if (rows.length === 0) { await ctx.reply('📋 No warnings!'); return; }
    let text = '⚠️ *Warnings:*\n\n';
    for (const row of rows as any[]) text += `• @${row.user_id.split('@')[0]}: ${row.count} warnings\n`;
    await ctx.reply(text);
  },
};
