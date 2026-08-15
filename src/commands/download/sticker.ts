import { CommandContext } from '../types';
import sharp from 'sharp';

export default {
  name: 'sticker',
  alias: ['s', 'stik'],
  category: 'Download',
  description: 'Create sticker from image',
  usage: '.sticker (reply to image)',
  permission: 1,
  cooldown: 5,
  handler: async (ctx: CommandContext) => {
    if (!ctx.quoted?.message?.imageMessage && !ctx.message?.message?.imageMessage) {
      await ctx.reply('📷 Please reply to an image to create a sticker!');
      return;
    }
    try {
      const quoted = ctx.quoted ? ctx.quoted.message : ctx.message.message;
      const downloadMsg: any = { message: quoted };
      const stream = await ctx.client.downloadMediaMessage(downloadMsg);
      const processed = await sharp(stream).resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).webp().toBuffer();
      await ctx.client.sendMessage(ctx.jid, { sticker: processed, pack: 'Hemix Bot', author: ctx.config.botName });
    } catch (err: any) {
      await ctx.reply(`❌ Error: ${err.message}`);
    }
  },
};
