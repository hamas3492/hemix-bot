import { CommandContext } from '../types';
import { formatUptime, detectPlatform } from '../../utils/helpers';

export default {
  name: 'alive',
  alias: ['botstatuscheck', 'isalive'],
  category: 'others',
  description: 'Check if bot is alive, show uptime and status',
  usage: 'alive',
  permission: 0,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const uptimeStr = formatUptime(process.uptime());
    const platform = detectPlatform();
    const statusEmoji = ctx.db.getSetting('status_emoji') || '🟢';

    const aliveText = `╭─── [ ${statusEmoji} *HEMIX BOT STATUS* ] ───
│
├ ❇️ *Status:* Active & Online
├ 🤖 *Bot Name:* ${ctx.config.botName || 'Hemix'}
├ 🔖 *Version:* v${ctx.config.version || '1.0.0'}
├ ⏳ *Uptime:* ${uptimeStr}
├ 💻 *Environment:* ${platform}
├ 🗄️ *Database:* Connected (SQLite)
│
├ 💡 *Type* \`${ctx.config.botPrefix || '.'}menu\` *for command list.*
│
╰───────────────────────────────
_${ctx.config.footer || 'Powered by Hemix Bot V1.0'}_`;

    await ctx.reply(aliveText);
  },
};
