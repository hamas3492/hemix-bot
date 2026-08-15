import { CommandContext } from '../types';
import { detectPlatform, formatUptime } from '../../utils/helpers';

export default {
  name: 'botinfo',
  alias: ['info', 'binfo', 'about'],
  category: 'general',
  description: 'Show bot info (name, version, platform, uptime, prefix, mode)',
  usage: 'botinfo',
  permission: 0,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const uptimeStr = formatUptime(process.uptime());
    const platform = detectPlatform();
    const botName = ctx.config.botName || 'Hemix Bot';
    const version = ctx.config.version || '1.0.0';
    const prefix = ctx.config.botPrefix || '.';
    const mode = ctx.config.botMode || 'public';
    const ownerName = ctx.config.ownerName || 'Owner';

    const infoMsg = `╭─── [ 🤖 *${botName.toUpperCase()} INFO* ] ───
│
├ 🏷️ *Name:* ${botName}
├ 🔖 *Version:* v${version}
├ 💻 *Platform:* ${platform}
├ ⏳ *Uptime:* ${uptimeStr}
├ ⚡ *Prefix:* ${prefix}
├ 🔒 *Mode:* ${mode.toUpperCase()}
├ 👑 *Owner:* ${ownerName}
├ 🟢 *Node:* ${process.version}
│
╰───────────────────────────
_${ctx.config.footer || 'Powered by Hemix Bot V1.0'}_`;

    await ctx.reply(infoMsg);
  },
};
