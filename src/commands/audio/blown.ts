import { CommandContext } from '../types';
import { writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';

export default {
  name: 'blown',
  alias: [],
  category: 'Audio',
  description: 'Blown audio effect',
  usage: '.blown (reply to audio)',
  permission: 1,
  cooldown: 10,
  handler: async (ctx: CommandContext) => {
    if (!ctx.quoted?.message?.audioMessage) { await ctx.reply('🎵 Please reply to an audio!'); return; }
    await ctx.reply('💨 Adding blown effect...');
    try {
      const stream = await ctx.client.downloadMediaMessage({ message: ctx.quoted.message });
      const input = join(process.cwd(), 'tmp', `blown_in_${Date.now()}.mp3`);
      const output = join(process.cwd(), 'tmp', `blown_out_${Date.now()}.mp3`);
      writeFileSync(input, stream);
      const ffmpeg = require('fluent-ffmpeg');
      ffmpeg(input).audioFilter(['acrusher=level_in=8:level_out=0.5:bits=8:mode=log:aa=1']).save(output).on('end', async () => {
        const buf = require('fs').readFileSync(output);
        await ctx.replyMedia(buf, 'audio/mpeg', '💨 Blown Effect');
        try { unlinkSync(input); unlinkSync(output); } catch {}
      }).on('error', (err: any) => ctx.reply(`❌ Error: ${err.message}`));
    } catch (err: any) { await ctx.reply(`❌ Error: ${err.message}`); }
  },
};
