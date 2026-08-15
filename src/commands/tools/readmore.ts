import { CommandContext } from '../types';

export default {
  name: 'readmore',
  alias: ['rmore', 'spoiler'],
  category: 'tools',
  description: 'Add Read More WhatsApp hidden separator to text',
  usage: 'readmore <title> | <body>',
  permission: 0,
  cooldown: 2,
  handler: async (ctx: CommandContext) => {
    const text = ctx.text || ctx.args.join(' ');
    if (!text) {
      return await ctx.reply('⚠️ Usage: `readmore Visible Title | Secret Hidden Body`');
    }

    const readMoreChar = '\u200B'.repeat(4000);
    const parts = text.split('|');

    if (parts.length >= 2) {
      const title = parts[0].trim();
      const body = parts.slice(1).join('|').trim();
      await ctx.reply(`${title}${readMoreChar}\n\n${body}`);
    } else {
      await ctx.reply(`Read More Hidden Separator Added!${readMoreChar}\n\n${text}`);
    }
  },
};
