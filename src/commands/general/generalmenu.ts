import { CommandContext } from '../types';

export default {
  name: 'generalmenu',
  alias: ['genmenu', 'gmenu'],
  category: 'general',
  description: 'Show general commands menu',
  usage: 'generalmenu',
  permission: 0,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const prefix = ctx.config.botPrefix || '.';
    const menuMsg = `╭─── [ 🌐 *GENERAL COMMANDS* ] ───
│
├ 🤖 *${prefix}botinfo* — Show bot details and system info
├ 📂 *${prefix}categories* — List all available command categories
├ 📋 *${prefix}generalmenu* — Display this general commands menu
├ 🔍 *${prefix}list <category>* — List commands in a specific category
├ 📜 *${prefix}menu* — Dynamic main menu showing all commands
│
╰─────────────────────────────────
_${ctx.config.footer || 'Powered by Hemix Bot V1.0'}_`;

    await ctx.reply(menuMsg);
  },
};
