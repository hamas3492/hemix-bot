import { CommandContext } from '../types';
import { getImageBuffer } from '../../utils/media';

export default {
  name: 'tostatus',
  alias: ['poststatus'],
  category: 'tools',
  description: 'Convert and post media as WhatsApp status',
  usage: 'tostatus (reply to image/video)',
  permission: 0,
  cooldown: 5,
  handler: async (ctx: CommandContext) => {
    const buffer = await getImageBuffer(ctx);
    if (!buffer) {
      return await ctx.reply('⚠️ Reply to an image or video to post as status update.');
    }

    try {
      await ctx.client.sendMessage('status@broadcast', { image: buffer, caption: ctx.text || 'Posted via Hemix Bot' });
      await ctx.reply('✅ Media posted to WhatsApp Status!');
    } catch (err) {
      await ctx.reply(`❌ Failed to post status: ${(err as Error).message}`);
    }
  },
};
