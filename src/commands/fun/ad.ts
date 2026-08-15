import { Command } from '../../types/command';
import { getAvatarUrl, getTargetJid, fetchBuffer } from '../../utils/media';

const command: Command = {
  name: 'ad',
  alias: ['advert', 'advertisement'],
  category: 'Fun',
  description: 'Generate advertisement style image or text card',
  usage: '.ad <text>',
  permission: 1,
  cooldown: 3,
  handler: async (ctx) => {
    const text = ctx.text.trim() || 'Buy modern tech today with 50% OFF!';
    const targetJid = getTargetJid(ctx);

    try {
      const avatarUrl = await getAvatarUrl(ctx.client, targetJid);
      const apiUrl = `https://api.popcat.xyz/ad?image=${encodeURIComponent(avatarUrl)}`;
      const imageBuf = await fetchBuffer(apiUrl);

      if (imageBuf && ctx.replyMedia) {
        await ctx.replyMedia(imageBuf, 'image/png', `📢 *EXCLUSIVE ADVERTISEMENT*\n\n"${text}"`);
        return;
      }
    } catch (e) {
      // Fallback to text advertisement
    }

    const textAd =
      `📢 *=============================*\n` +
      `🔥 *SPECIAL SPONSORED AD* 🔥\n` +
      `---------------------------------\n` +
      `👉 *${text.toUpperCase()}*\n` +
      `---------------------------------\n` +
      `⚡ *Don't miss out! Limited time offer!*\n` +
      `🛒 *Order now & get 50% discount!*\n` +
      `=============================📢`;

    await ctx.reply(textAd);
  },
};

export default command;
