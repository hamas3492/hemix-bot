import { CommandContext } from '../types';

export default {
  name: 'repo',
  alias: ['sc', 'script', 'source', 'github'],
  category: 'others',
  description: 'Show repository info (placeholder URL)',
  usage: 'repo',
  permission: 0,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const repoMsg = `╭─── [ 📦 *REPOSITORY INFO* ] ───
│
├ 🤖 *Bot Name:* Hemix Bot V1.0
├ 📜 *Description:* Self-pairing WhatsApp bot with AI, automation & dashboard
├ 🌐 *GitHub Repo:* https://github.com/Hemix/hemix-bot
├ 📄 *License:* MIT
├ ⭐ *Stars:* ★★★★★
│
├ 💡 *Feel free to star & fork the repository!*
│
╰───────────────────────────────
_${ctx.config.footer || 'Powered by Hemix Bot V1.0'}_`;

    await ctx.reply(repoMsg);
  },
};
