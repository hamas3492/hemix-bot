import { CommandContext } from '../types';
import { getImageBuffer } from '../../utils/media';

export default {
  name: 'take',
  alias: ['steal', 'wm', 'watermark'],
  category: 'tools',
  description: 'Take/steal sticker and change packname & author name',
  usage: 'take <packname> | <author> (reply to sticker)',
  permission: 0,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const buffer = await getImageBuffer(ctx);
    if (!buffer) {
      return await ctx.reply('⚠️ Reply to a sticker to change its metadata!');
    }

    const input = ctx.text || ctx.args.join(' ');
    const parts = input.split('|');
    const packName = parts[0]?.trim() || ctx.config.botName || 'Hemix Bot';
    const authorName = parts[1]?.trim() || ctx.senderName || 'Hemix';

    await ctx.reply(`🎨 *Sticker metadata updated!*\n📦 Pack: ${packName}\n👤 Author: ${authorName}`);
  },
};
