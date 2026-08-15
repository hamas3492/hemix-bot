import { Command } from '../../types/command';
import { fetchBuffer } from '../../utils/media';

const command: Command = {
  name: 'caution',
  alias: ['cautionboard', 'caution sign'],
  category: 'Fun',
  description: 'Generate caution sign image or text warning board',
  usage: '.caution <text>',
  permission: 1,
  cooldown: 3,
  handler: async (ctx) => {
    const text = ctx.text.trim() || 'DANGER: HIGH VOLTAGE BRAIN CELLS';

    try {
      const apiUrl = `https://api.popcat.xyz/caution?text=${encodeURIComponent(text)}`;
      const imageBuf = await fetchBuffer(apiUrl);

      if (imageBuf && ctx.replyMedia) {
        await ctx.replyMedia(imageBuf, 'image/png', `⚠️ *CAUTION SIGN*`);
        return;
      }
    } catch (e) {
      // Fallback to text box
    }

    const asciiBox =
      `⚠️ *===============================*\n` +
      `⚠️       *OFFICIAL CAUTION NOTICE*       ⚠️\n` +
      `-----------------------------------\n` +
      `🛑  *${text.toUpperCase()}*\n` +
      `-----------------------------------\n` +
      `⚠️ *PROCEED WITH EXTREME CAUTION!* ⚠️\n` +
      `===============================⚠️`;

    await ctx.reply(asciiBox);
  },
};

export default command;
