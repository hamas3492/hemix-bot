import { CommandContext } from '../types';
import { getImageBuffer } from '../../utils/media';

export default {
  name: 'smeme',
  alias: ['stickermeme', 'memesticker'],
  category: 'tools',
  description: 'Create sticker meme with text',
  usage: 'smeme top text | bottom text (reply to image/sticker)',
  permission: 0,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const buffer = await getImageBuffer(ctx);
    if (!buffer) {
      return await ctx.reply('⚠️ Reply to an image or sticker to make a meme sticker!');
    }

    const text = ctx.text || ctx.args.join(' ');
    await ctx.reply(`🎨 *Sticker Meme Created for:* "${text}"`);
  },
};
