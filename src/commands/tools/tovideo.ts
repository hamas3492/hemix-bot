import { CommandContext } from '../types';
import { getImageBuffer } from '../../utils/media';

export default {
  name: 'tovideo',
  alias: ['tomp4', 'stickertovideo'],
  category: 'tools',
  description: 'Convert animated sticker/image to video format',
  usage: 'tovideo (reply to animated sticker)',
  permission: 0,
  cooldown: 4,
  handler: async (ctx: CommandContext) => {
    const buffer = await getImageBuffer(ctx);
    if (!buffer) {
      return await ctx.reply('⚠️ Reply to an animated sticker or image to convert to video.');
    }

    await ctx.reply('🎥 *Converting to MP4 Video format...*');
  },
};
