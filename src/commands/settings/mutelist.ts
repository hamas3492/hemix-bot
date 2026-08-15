import { CommandContext } from '../types'; import { db } from '../../database';
export default {
  name: 'mutelist', alias: ['ml'], category: 'Settings', description: 'List muted chats', usage: '.mutelist', permission: 4, cooldown: 5,
  handler: async (ctx: CommandContext) => {
    const rows = db.query("SELECT group_id FROM group_settings WHERE key = 'mute' AND value = 'true'");
    if (rows.length === 0) { await ctx.reply('📋 No muted chats!'); return; }
    let text = '🔇 *Muted Chats:*\n\n';
    for (const row of rows as any[]) text += `• ${row.group_id}\n`;
    await ctx.reply(text);
  },
};
