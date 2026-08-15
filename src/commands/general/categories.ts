import { CommandContext } from '../types';

export default {
  name: 'categories',
  alias: ['cats', 'cmdcategories'],
  category: 'general',
  description: 'List all command categories',
  usage: 'categories',
  permission: 0,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const prefix = ctx.config.botPrefix || '.';
    const text = `╭─── [ 📂 *COMMAND CATEGORIES* ] ───
│
├ 📁 *General* — Basic bot commands and information menus
├ 📁 *Others* — System metrics, utility check & status tools
├ 📁 *Owner* — Administrative and management tools
│
├ 💡 *Tip:* Use \`${prefix}list <category>\` to see commands in a category.
├ 💡 *Example:* \`${prefix}list general\` or \`${prefix}menu\` for all.
│
╰────────────────────────────────
_${ctx.config.footer || 'Powered by Hemix Bot V1.0'}_`;

    await ctx.reply(text);
  },
};
