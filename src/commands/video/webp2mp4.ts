import { CommandContext } from '../types';
import { writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';

export default {
  name: 'webp2mp4',
  alias: ['sticker2video', 'togif'],
  category: 'Video',
  description: 'Convert webp sticker to MP4',
  usage: '.webp2mp4 (reply to sticker)',
  permission: 1,
  cooldown: 10,
  handler: async (ctx: CommandContext) => {
    if (!ctx.quoted?.message?.stickerMessage) { await ctx.reply('🎬 Please reply to a sticker!'); return; }
    await ctx.reply('🎬 Converting sticker to video...');
    try {
      const stream = await ctx.client.downloadMediaMessage({ message: ctx.quoted.message });
      const input = join(process.cwd(), 'tmp', `webp_in_${Date.now()}.webp`);
      const output = join(process.cwd(), 'tmp', `webp_out_${Date.now()}.mp4`);
      writeFileSync(input, stream);
      const ffmpeg = require('fluent-ffmpeg');
      ffmpeg(input).inputFormat('webp').outputOptions(['-pix_fmt yuv420p', '-movflags +faststart']).save(output).on('end', async () => {
        const buf = require('fs').readFileSync(output);
        await ctx.client.sendMessage(ctx.jid, { video: buf, caption: '🎬 Converted from sticker' });
        try { unlinkSync(input); unlinkSync(output); } catch {}
      }).on('error', (err: any) => ctx.reply(`❌ Error: ${err.message}`));
    } catch (err: any) { await ctx.reply(`❌ Error: ${err.message}`); }
  },
};
