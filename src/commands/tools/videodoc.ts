import { CommandContext } from '../types';
import { getImageBuffer } from '../../utils/media';

export default {
  name: 'videodoc',
  alias: ['tovideodoc', 'docvideo'],
  category: 'tools',
  description: 'Convert video to document attachment',
  usage: 'videodoc (reply to video)',
  permission: 0,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const buffer = await getImageBuffer(ctx);
    if (!buffer) {
      return await ctx.reply('⚠️ Please reply to a video message.');
    }

    try {
      await ctx.client.sendMessage(
        ctx.jid,
        {
          document: buffer,
          mimetype: 'video/mp4',
          fileName: `video_${Date.now()}.mp4`,
        },
        { quoted: ctx.message }
      );
    } catch (err) {
      await ctx.reply(`❌ Failed to convert video to document: ${(err as Error).message}`);
    }
  },
};
