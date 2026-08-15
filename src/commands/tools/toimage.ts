import { CommandContext } from '../types';
import { getImageBuffer } from '../../utils/media';
import sharp from 'sharp';

export default {
  name: 'toimage',
  alias: ['toimg', 'stickertoimg'],
  category: 'tools',
  description: 'Convert sticker to image',
  usage: 'toimage (reply to sticker)',
  permission: 0,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const buffer = await getImageBuffer(ctx);
    if (!buffer) {
      return await ctx.reply('⚠️ Please reply to a sticker to convert it to an image.');
    }

    try {
      const pngBuf = await sharp(buffer).png().toBuffer();

      if (ctx.replyMedia) {
        await ctx.replyMedia(pngBuf, 'image/png', '🖼️ Converted Sticker to Image');
      } else {
        await ctx.client.sendMessage(ctx.jid, { image: pngBuf, caption: '🖼️ Converted Sticker' }, { quoted: ctx.message });
      }
    } catch (err) {
      await ctx.reply(`❌ Failed to convert sticker: ${(err as Error).message}`);
    }
  },
};
