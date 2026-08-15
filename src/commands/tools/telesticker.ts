import { CommandContext } from '../types';

export default {
  name: 'telesticker',
  alias: ['tgsticker', 'telegramsticker'],
  category: 'tools',
  description: 'Download sticker pack from Telegram link',
  usage: 'telesticker <telegram sticker link>',
  permission: 0,
  cooldown: 5,
  handler: async (ctx: CommandContext) => {
    const link = ctx.args[0] || ctx.text;
    if (!link || !link.includes('t.me/addstickers/')) {
      return await ctx.reply('⚠️ Please provide a valid Telegram sticker pack link (e.g. `telesticker https://t.me/addstickers/packname`)');
    }

    const packName = link.split('addstickers/')[1]?.split('/')[0];
    await ctx.reply(`📦 *Downloading Telegram Sticker Pack:* \`${packName}\`...`);
  },
};
