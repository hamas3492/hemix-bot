import { Command } from '../../types/command';
import { getAvatarUrl, getTargetJid, fetchBuffer } from '../../utils/media';

const command: Command = {
  name: 'jail',
  alias: ['jailed', 'prison'],
  category: 'Fun',
  description: 'Put target avatar or image behind jail bars',
  usage: '.jail [mention]',
  permission: 1,
  cooldown: 3,
  handler: async (ctx) => {
    const targetJid = getTargetJid(ctx);

    try {
      const avatarUrl = await getAvatarUrl(ctx.client, targetJid);
      const apiUrl = `https://api.popcat.xyz/jail?image=${encodeURIComponent(avatarUrl)}`;
      const imageBuf = await fetchBuffer(apiUrl);

      if (imageBuf && ctx.replyMedia) {
        await ctx.replyMedia(imageBuf, 'image/png', `🚔 *LOCK 'EM UP!* Sent straight to prison! ⛓️`);
        return;
      }
    } catch (e) {
      // Fallback
    }

    const asciiJail =
      `⛓️ *PRISON CELL SENTENCE* ⛓️\n\n` +
      `|  |  |  |  |  |\n` +
      `|  🔒 LOCKED 🔒  |\n` +
      `|  |  |  |  |  |\n` +
      `|   ( 😭 )   |\n` +
      `|  |  |  |  |  |\n\n` +
      `🚨 *Busted! 10 years without phone access!*`;

    await ctx.reply(asciiJail);
  },
};

export default command;
