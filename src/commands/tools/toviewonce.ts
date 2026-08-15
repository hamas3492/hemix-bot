import { CommandContext } from '../types';
import { getImageBuffer } from '../../utils/media';

export default {
  name: 'toviewonce',
  alias: ['makevo'],
  category: 'tools',
  description: 'Send replied media as view-once',
  usage: 'toviewonce (reply to media)',
  permission: 0,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const buffer = await getImageBuffer(ctx);
    if (!buffer) {
      return await ctx.reply('⚠️ Please reply to an image or video.');
    }

    try {
      await ctx.client.sendMessage(ctx.jid, { image: buffer, viewOnce: true }, { quoted: ctx.message });
    } catch (err) {
      await ctx.reply(`❌ Error sending view once: ${(err as Error).message}`);
    }
  },
};
