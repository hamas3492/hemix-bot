import { CommandContext } from '../types';
import { writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';

export default {
  name: 'earrape',
  alias: ['er'],
  category: 'Audio',
  description: 'Extreme distortion effect',
  usage: '.earrape (reply to audio)',
  permission: 1,
  cooldown: 10,
  handler: async (ctx: CommandContext) => {
    if (!ctx.quoted?.message?.audioMessage) { await ctx.reply('🎵 Please reply to an audio!'); return; }
    await ctx.reply('🔊 Adding earrape effect...');
    try {
      const stream = await ctx.client.downloadMediaMessage({ message: ctx.quoted.message });
      const input = join(process.cwd(), 'tmp', `er_in_${Date.now()}.mp3`);
      const output = join(process.cwd(), 'tmp', `er_out_${Date.now()}.mp3`);
      writeFileSync(input, stream);
      const ffmpeg = require('fluent-ffmpeg');
      ffmpeg(input).audioFilter(['bass=g=40,volume=5,acrusher=level_in=10:level_out=0.1:bits=4:mode=log:aa=1']).save(output).on('end', async () => {
        const buf = require('fs').readFileSync(output);
        await ctx.replyMedia(buf, 'audio/mpeg', '🔊 Earrape');
        try { unlinkSync(input); unlinkSync(output); } catch {}
      }).on('error', (err: any) => ctx.reply(`❌ Error: ${err.message}`));
    } catch (err: any) { await ctx.reply(`❌ Error: ${err.message}`); }
  },
};
