import { Command } from '../../types/command';
import { getAvatarUrl, getTargetJid, fetchBuffer } from '../../utils/media';

const command: Command = {
  name: 'gun',
  alias: ['gunshot', 'shoot'],
  category: 'Fun',
  description: 'Gun image effect on target avatar',
  usage: '.gun [mention]',
  permission: 1,
  cooldown: 3,
  handler: async (ctx) => {
    const targetJid = getTargetJid(ctx);

    try {
      const avatarUrl = await getAvatarUrl(ctx.client, targetJid);
      const apiUrl = `https://api.popcat.xyz/gun?image=${encodeURIComponent(avatarUrl)}`;
      const imageBuf = await fetchBuffer(apiUrl);

      if (imageBuf && ctx.replyMedia) {
        await ctx.replyMedia(imageBuf, 'image/png', `🔫 *PULL THE TRIGGER!*`);
        return;
      }
    } catch (e) {
      // API fallback
    }

    const textGun =
      `🔫 *BANG! BANG!* 💥\n\n` +
      `  |\\___/|     🔫 [GUN POINTED]\n` +
      ` ( • ω • )    "Hands in the air right now!"\n` +
      ` /|     |\\`;

    await ctx.reply(textGun);
  },
};

export default command;
