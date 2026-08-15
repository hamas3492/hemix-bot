import { CommandContext } from '../types';
import { getImageBuffer } from '../../utils/media';

export default {
  name: 'sendasviewonce',
  alias: ['viewonce', 'tovo'],
  category: 'tools',
  description: 'Send replied media as view-once message',
  usage: 'sendasviewonce (reply to image/video)',
  permission: 0,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const buffer = await getImageBuffer(ctx);
    if (!buffer) {
      return await ctx.reply('⚠️ Please reply to an image or video media.');
    }

    try {
      await ctx.client.sendMessage(ctx.jid, { image: buffer, viewOnce: true, caption: '👁️ View-Once Media' }, { quoted: ctx.message });
    } catch (err) {
      await ctx.reply(`❌ Error sending view-once media: ${(err as Error).message}`);
    }
  },
};
