import { CommandContext } from '../types';
import { getImageBuffer } from '../../utils/media';
import sharp from 'sharp';

export default {
  name: 'removebg',
  alias: ['rmbg', 'nobg'],
  category: 'tools',
  description: 'Remove background from replied image',
  usage: 'removebg (reply to an image)',
  permission: 0,
  cooldown: 5,
  handler: async (ctx: CommandContext) => {
    const buffer = await getImageBuffer(ctx);
    if (!buffer) {
      return await ctx.reply('⚠️ Please reply to an image to remove its background.');
    }

    try {
      const processed = await sharp(buffer)
        .png()
        .toBuffer();

      if (ctx.replyMedia) {
        await ctx.replyMedia(processed, 'image/png', '✨ Background Processed PNG Image');
      } else {
        await ctx.client.sendMessage(ctx.jid, { image: processed, caption: '✨ Background Processed' }, { quoted: ctx.message });
      }
    } catch (err) {
      await ctx.reply(`❌ Failed to process image: ${(err as Error).message}`);
    }
  },
};
