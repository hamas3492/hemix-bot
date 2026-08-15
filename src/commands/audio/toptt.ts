import path from 'path';
import { CommandContext } from '../types';

export default {
  name: 'toptt',
  alias: ['tovn', 'voice'],
  category: 'Audio',
  description: 'Convert audio to PTT voice note',
  usage: '.toptt (reply to audio)',
  permission: 1,
  cooldown: 10,
  handler: async (ctx: CommandContext) => {
    if (!ctx.quoted?.message?.audioMessage && !ctx.quoted?.message?.videoMessage) {
      await ctx.reply('🎵 Please reply to an audio or video!'); return;
    }
    await ctx.reply('🎤 Converting to voice note...');
    try {
      const stream = await ctx.client.downloadMediaMessage({ message: ctx.quoted.message });
      const input = path.join(process.cwd(), 'tmp', `ptt_in_${Date.now()}`);
      const output = path.join(process.cwd(), 'tmp', `ptt_out_${Date.now()}.mp3`);
      require('fs').writeFileSync(input, stream);
      const ffmpeg = require('fluent-ffmpeg');
      ffmpeg(input).noVideo().format('mp3').audioBitrate(64).save(output).on('end', async () => {
        const buf = require('fs').readFileSync(output);
        await ctx.client.sendMessage(ctx.jid, { audio: buf, mimetype: 'audio/mp4', ptt: true }, { quoted: ctx.message });
        try { require('fs').unlinkSync(input); require('fs').unlinkSync(output); } catch {}
      }).on('error', (err: any) => ctx.reply(`❌ Error: ${err.message}`));
    } catch (err: any) { await ctx.reply(`❌ Error: ${err.message}`); }
  },
};
