import { CommandContext } from '../types'; import { db } from '../../database';
export default {
  name: 'setstickerauthor', alias: ['stpackauthor'], category: 'Owner', description: 'Set sticker author name', usage: '.setstickerauthor <name>', permission: 4, cooldown: 3,
  handler: async (ctx: CommandContext) => {
    if (!ctx.text) { await ctx.reply('Usage: .setstickerauthor <name>'); return; }
    db.setSetting('sticker_author', ctx.text); await ctx.reply(`✅ Sticker author set to: ${ctx.text}`);
  },
};
