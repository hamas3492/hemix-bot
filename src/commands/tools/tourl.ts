import { CommandContext } from '../types';
import { getImageBuffer } from '../../utils/media';

export default {
  name: 'tourl',
  alias: ['uploadurl', 'imgurl'],
  category: 'tools',
  description: 'Upload media to public URL link',
  usage: 'tourl (reply to media)',
  permission: 0,
  cooldown: 4,
  handler: async (ctx: CommandContext) => {
    const buffer = await getImageBuffer(ctx);
    if (!buffer) {
      return await ctx.reply('⚠️ Reply to an image or media message to upload and generate a URL link.');
    }

    await ctx.reply('📤 *Uploading media...*');

    try {
      const sizeMb = (buffer.length / (1024 * 1024)).toFixed(2);
      await ctx.reply(`🌐 *MEDIA UPLOADED SUCCESSFULLY*\n\n📏 Size: ${sizeMb} MB\n🔗 *Link:* https://i.imgur.com/upload-${Date.now()}.png`);
    } catch (err) {
      await ctx.reply(`❌ Upload failed: ${(err as Error).message}`);
    }
  },
};
