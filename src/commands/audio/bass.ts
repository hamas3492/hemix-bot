import { CommandContext } from '../types';
import { writeFileSync, unlinkSync, existsSync } from 'fs';
import { join } from 'path';

export default {
  name: 'bass',
  alias: ['bassboost'],
  category: 'Audio',
  description: 'Boost bass of replied audio',
  usage: '.bass (reply to audio)',
  permission: 1,
  cooldown: 10,
  handler: async (ctx: CommandContext) => {
    if (!ctx.quoted?.message?.audioMessage && !ctx.quoted?.message?.videoMessage) {
      await ctx.reply('🎵 Please reply to an audio/voice note!'); return;
    }
    await ctx.reply('🔊 Boosting bass...');
    try {
      const stream = await ctx.client.downloadMediaMessage({ message: ctx.quoted.message });
      const input = join(process.cwd(), 'tmp', `bass_in_${Date.now()}.mp3`);
      const output = join(process.cwd(), 'tmp', `bass_out_${Date.now()}.mp3`);
      writeFileSync(input, stream);
      const ffmpeg = require('fluent-ffmpeg');
      ffmpeg(input).audioFilter(['bass=g=15,treble=g=5']).save(output).on('end', async () => {
        const buf = require('fs').readFileSync(output);
        await ctx.replyMedia(buf, 'audio/mpeg', '🔊 Bass Boosted');
        unlinkSync(input); if (existsSync(output)) unlinkSync(output);
      }).on('error', (err: any) => { ctx.reply(`❌ Error: ${err.message}`); unlinkSync(input); });
    } catch (err: any) { await ctx.reply(`❌ Error: ${err.message}`); }
  },
};
