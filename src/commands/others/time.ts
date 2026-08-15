import { CommandContext } from '../types';

export default {
  name: 'time',
  alias: ['clock', 'date', 'now'],
  category: 'others',
  description: 'Show current time in configured timezone',
  usage: 'time',
  permission: 0,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const tz = ctx.config.timezone || 'Asia/Karachi';
    const now = new Date();

    let formattedTime = '';
    let formattedDate = '';
    let dayName = '';

    try {
      formattedTime = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      }).format(now);

      formattedDate = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(now);

      dayName = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        weekday: 'long',
      }).format(now);
    } catch {
      formattedTime = now.toLocaleTimeString();
      formattedDate = now.toLocaleDateString();
      dayName = 'Current Day';
    }

    const timeMsg = `╭─── [ 🕒 *CURRENT TIME & DATE* ] ───
│
├ ⏰ *Time:* ${formattedTime}
├ 📅 *Date:* ${formattedDate}
├ 🗓️ *Day:* ${dayName}
├ 🌍 *Timezone:* ${tz}
│
╰─────────────────────────────────
_${ctx.config.footer || 'Powered by Hemix Bot V1.0'}_`;

    await ctx.reply(timeMsg);
  },
};
