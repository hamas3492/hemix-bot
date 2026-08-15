import { CommandContext } from '../types';
import { writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';

export default {
  name: 'toaudio',
  alias: ['tomp3', 'toaud'],
  category: 'Audio',
  description: 'Convert video/voice to audio',
  usage: '.toaudio (reply to video/voice)',
  permission: 1,
  cooldown: 10,
  handler: async (ctx: CommandContext) => {
    if (!ctx.quoted?.message?.videoMessage && !ctx.quoted?.message?.audioMessage && !ctx.quoted?.message?.pttMessage) {
      await ctx.reply('🎵 Please reply to a video or voice note!'); return;
    }
    await ctx.reply('🎵 Converting to audio...');
    try {
      const stream = await ctx.client.downloadMediaMessage({ message: ctx.quoted.message });
      const input = join(process.cwd(), 'tmp', `conv_in_${Date.now()}`);
      const output = join(process.cwd(), 'tmp', `conv_out_${Date.now()}.mp3`);
      writeFileSync(input, stream);
      const ffmpeg = require('fluent-ffmpeg');
      ffmpeg(input).noVideo().format('mp3').save(output).on('end', async () => {
        const buf = require('fs').readFileSync(output);
        await ctx.replyMedia(buf, 'audio/mpeg', '🎵 Converted Audio');
        try { unlinkSync(input); unlinkSync(output); } catch {}
      }).on('error', (err: any) => ctx.reply(`❌ Error: ${err.message}`));
    } catch (err: any) { await ctx.reply(`❌ Error: ${err.message}`); }
  },
};
