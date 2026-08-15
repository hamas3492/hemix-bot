import { CommandContext } from '../types';
import { getImageBuffer } from '../../utils/media';

export default {
  name: 'vv2',
  alias: ['revealvo', 'viewonce2'],
  category: 'tools',
  description: 'Convert view-once media into permanent viewable media',
  usage: 'vv2 (reply to view-once media)',
  permission: 0,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const buffer = await getImageBuffer(ctx);
    if (!buffer) {
      return await ctx.reply('⚠️ Please reply to a view-once media message.');
    }

    try {
      if (ctx.replyMedia) {
        await ctx.replyMedia(buffer, 'image/jpeg', '🔓 View-Once Media Revealed!');
      } else {
        await ctx.client.sendMessage(ctx.jid, { image: buffer, caption: '🔓 View-Once Media Revealed!' }, { quoted: ctx.message });
      }
    } catch (err) {
      await ctx.reply(`❌ Failed to reveal view-once media: ${(err as Error).message}`);
    }
  },
};
