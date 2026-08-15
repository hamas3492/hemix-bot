import path from 'path';
import { CommandContext } from '../types';

export default {
  name: 'aza',
  alias: ['azaan'],
  category: 'Audio',
  description: 'Add azaan style bass boost to audio',
  usage: '.aza (reply to audio)',
  permission: 1,
  cooldown: 10,
  handler: async (ctx: CommandContext) => {
    if (!ctx.quoted?.message?.audioMessage) { await ctx.reply('🎵 Please reply to an audio!'); return; }
    await ctx.reply('🕌 Processing azaan style...');
    try {
      const stream = await ctx.client.downloadMediaMessage({ message: ctx.quoted.message });
      const input = path.join(process.cwd(), 'tmp', `aza_in_${Date.now()}.mp3`);
      const output = path.join(process.cwd(), 'tmp', `aza_out_${Date.now()}.mp3`);
      require('fs').writeFileSync(input, stream);
      const ffmpeg = require('fluent-ffmpeg');
      ffmpeg(input).audioFilter(['bass=g=20,treble=g=-3,echo=0.8:0.9:1000:0.3']).save(output).on('end', async () => {
        const buf = require('fs').readFileSync(output);
        await ctx.replyMedia(buf, 'audio/mpeg', '🕌 Azaan Style');
        try { require('fs').unlinkSync(input); require('fs').unlinkSync(output); } catch {}
      }).on('error', (err: any) => ctx.reply(`❌ Error: ${err.message}`));
    } catch (err: any) { await ctx.reply(`❌ Error: ${err.message}`); }
  },
};
