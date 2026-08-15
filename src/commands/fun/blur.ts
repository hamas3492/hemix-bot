import { Command } from '../../types/command';
import { getImageBuffer, getAvatarUrl, getTargetJid, fetchBuffer } from '../../utils/media';
import sharp from 'sharp';

const command: Command = {
  name: 'blur',
  alias: ['blurimage'],
  category: 'Fun',
  description: 'Blur replied image or profile picture',
  usage: '.blur (reply to image or mention)',
  permission: 1,
  cooldown: 3,
  handler: async (ctx) => {
    try {
      let imageBuffer = await getImageBuffer(ctx);

      if (imageBuffer) {
        const blurredBuf = await sharp(imageBuffer).blur(12).toBuffer();
        if (ctx.replyMedia) {
          await ctx.replyMedia(blurredBuf, 'image/jpeg', '👁️ Blurred Image Effect');
          return;
        }
      }

      // Try avatar if no media in context
      const targetJid = getTargetJid(ctx);
      const avatarUrl = await getAvatarUrl(ctx.client, targetJid);
      const apiUrl = `https://api.popcat.xyz/blur?image=${encodeURIComponent(avatarUrl)}`;
      const apiBuf = await fetchBuffer(apiUrl);

      if (apiBuf && ctx.replyMedia) {
        await ctx.replyMedia(apiBuf, 'image/png', '👁️ Blurred Profile Picture Effect');
        return;
      }
    } catch (err) {
      // Blur failed
    }

    await ctx.reply('👁️ *Blur Effect:* Please reply to an image or mention a user to blur their avatar!');
  },
};

export default command;
