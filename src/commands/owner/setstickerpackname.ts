import { CommandContext } from '../types'; import { db } from '../../database';
export default {
  name: 'setstickerpackname', alias: ['stpackname'], category: 'Owner', description: 'Set sticker pack name', usage: '.setstickerpackname <name>', permission: 4, cooldown: 3,
  handler: async (ctx: CommandContext) => {
    if (!ctx.text) { await ctx.reply('Usage: .setstickerpackname <name>'); return; }
    db.setSetting('sticker_pack', ctx.text); await ctx.reply(`✅ Sticker pack name set to: ${ctx.text}`);
  },
};
