import path from 'path';
import { CommandContext } from '../types';

export default {
  name: 'tomp3',
  alias: ['mp3'],
  category: 'Audio',
  description: 'Convert media to MP3',
  usage: '.tomp3 (reply to media)',
  permission: 1,
  cooldown: 10,
  handler: async (ctx: CommandContext) => {
    if (!ctx.quoted?.message) { await ctx.reply('🎵 Please reply to a media message!'); return; }
    await ctx.reply('🎵 Converting to MP3...');
    try {
      const stream = await ctx.client.downloadMediaMessage({ message: ctx.quoted.message });
      const input = path.join(process.cwd(), 'tmp', `mp3_in_${Date.now()}`);
      const output = path.join(process.cwd(), 'tmp', `mp3_out_${Date.now()}.mp3`);
      require('fs').writeFileSync(input, stream);
      const ffmpeg = require('fluent-ffmpeg');
      ffmpeg(input).noVideo().format('mp3').audioBitrate(128).save(output).on('end', async () => {
        const buf = require('fs').readFileSync(output);
        await ctx.replyMedia(buf, 'audio/mpeg', '🎵 MP3 Audio');
        try { require('fs').unlinkSync(input); require('fs').unlinkSync(output); } catch {}
      }).on('error', (err: any) => ctx.reply(`❌ Error: ${err.message}`));
    } catch (err: any) { await ctx.reply(`❌ Error: ${err.message}`); }
  },
};
