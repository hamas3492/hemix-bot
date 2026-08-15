import { CommandContext } from '../types';

export default {
  name: 'owner',
  alias: ['creator', 'developer', 'dev'],
  category: 'others',
  description: 'Show owner info (name, number from config)',
  usage: 'owner',
  permission: 0,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const ownerName = ctx.config.ownerName || 'Hemix Owner';
    const ownerNumber = ctx.config.ownerNumber || 'Not Configured';
    const cleanNum = ownerNumber.replace(/[^0-9]/g, '');

    const ownerMsg = `╭─── [ 👑 *BOT OWNER INFORMATION* ] ───
│
├ 👤 *Owner Name:* ${ownerName}
├ 📞 *Contact Number:* ${ownerNumber ? `+${cleanNum}` : 'Not set'}
├ 💬 *WhatsApp Link:* ${cleanNum ? `https://wa.me/${cleanNum}` : 'N/A'}
│
├ 💡 *Feel free to contact for bot support or inquiries.*
│
╰────────────────────────────────────
_${ctx.config.footer || 'Powered by Hemix Bot V1.0'}_`;

    await ctx.reply(ownerMsg);
  },
};
