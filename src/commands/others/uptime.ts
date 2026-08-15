import os from 'os';
import { CommandContext } from '../types';
import { formatUptime } from '../../utils/helpers';

export default {
  name: 'uptime',
  alias: ['up', 'runtime'],
  category: 'others',
  description: 'Show bot uptime formatted',
  usage: 'uptime',
  permission: 0,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const processUptimeStr = formatUptime(process.uptime());
    const systemUptimeStr = formatUptime(os.uptime());

    const uptimeMsg = `╭─── [ ⌛ *BOT UPTIME* ] ───
│
├ 🤖 *Process Uptime:* ${processUptimeStr}
├ 🖥️ *System Uptime:* ${systemUptimeStr}
├ 🟢 *Status:* Online & Operational
│
╰─────────────────────────
_${ctx.config.footer || 'Powered by Hemix Bot V1.0'}_`;

    await ctx.reply(uptimeMsg);
  },
};
