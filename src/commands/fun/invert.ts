import { Command } from '../../types/command';
import { getImageBuffer, getAvatarUrl, getTargetJid, fetchBuffer } from '../../utils/media';
import sharp from 'sharp';

const command: Command = {
  name: 'invert',
  alias: ['invertcolors', 'negative'],
  category: 'Fun',
  description: 'Invert colors of replied image or avatar',
  usage: '.invert (reply to image or mention)',
  permission: 1,
  cooldown: 3,
  handler: async (ctx) => {
    try {
      const imageBuffer = await getImageBuffer(ctx);

      if (imageBuffer) {
        const invertedBuf = await sharp(imageBuffer).negate().toBuffer();
        if (ctx.replyMedia) {
          await ctx.replyMedia(invertedBuf, 'image/jpeg', '☯️ Inverted Color Effect');
          return;
        }
      }

      const targetJid = getTargetJid(ctx);
      const avatarUrl = await getAvatarUrl(ctx.client, targetJid);
      const apiUrl = `https://api.popcat.xyz/invert?image=${encodeURIComponent(avatarUrl)}`;
      const apiBuf = await fetchBuffer(apiUrl);

      if (apiBuf && ctx.replyMedia) {
        await ctx.replyMedia(apiBuf, 'image/png', '☯️ Inverted Avatar Effect');
        return;
      }
    } catch (err) {
      // Invert failed
    }

    await ctx.reply('☯️ *Invert Effect:* Please reply to an image or mention a user to invert colors!');
  },
};

export default command;
