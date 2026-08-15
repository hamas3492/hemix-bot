import { CommandContext } from '../types';
import { writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';

export default {
  name: 'robot',
  alias: ['robotify'],
  category: 'Audio',
  description: 'Robot voice effect',
  usage: '.robot (reply to audio)',
  permission: 1,
  cooldown: 10,
  handler: async (ctx: CommandContext) => {
    if (!ctx.quoted?.message?.audioMessage) { await ctx.reply('🎵 Please reply to an audio!'); return; }
    await ctx.reply('🤖 Robotifying voice...');
    try {
      const stream = await ctx.client.downloadMediaMessage({ message: ctx.quoted.message });
      const input = join(process.cwd(), 'tmp', `robot_in_${Date.now()}.mp3`);
      const output = join(process.cwd(), 'tmp', `robot_out_${Date.now()}.mp3`);
      writeFileSync(input, stream);
      const ffmpeg = require('fluent-ffmpeg');
      ffmpeg(input).audioFilter(['asetrate=44100*0.5,atempo=2,asetrate=44100*0.5,aresample=44100,vibrato=f=50:d=1']).save(output).on('end', async () => {
        const buf = require('fs').readFileSync(output);
        await ctx.replyMedia(buf, 'audio/mpeg', '🤖 Robot Voice');
        try { unlinkSync(input); unlinkSync(output); } catch {}
      }).on('error', (err: any) => ctx.reply(`❌ Error: ${err.message}`));
    } catch (err: any) { await ctx.reply(`❌ Error: ${err.message}`); }
  },
};
