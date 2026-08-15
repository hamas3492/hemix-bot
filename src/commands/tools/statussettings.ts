import { CommandContext } from '../types';

export default {
  name: 'statussettings',
  alias: ['statusconfig'],
  category: 'tools',
  description: 'View WhatsApp status automation settings',
  usage: 'statussettings',
  permission: 0,
  cooldown: 2,
  handler: async (ctx: CommandContext) => {
    const delay = ctx.db.getPlugin('status_delay') || 0;
    const autoView = ctx.db.getPlugin('autoview_status')?.enabled ?? true;
    const autoSave = ctx.db.getPlugin('autosave_status')?.enabled ?? false;

    const text = `⚙️ *WHATSAPP STATUS SETTINGS*

👁️ *Auto View Status:* ${autoView ? '🟢 ENABLED' : '🔴 DISABLED'}
💾 *Auto Save Status:* ${autoSave ? '🟢 ENABLED' : '🔴 DISABLED'}
⏱️ *Status View Delay:* ${delay} second(s)`;

    await ctx.reply(text);
  },
};
