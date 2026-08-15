import { downloadMediaMessage } from '@whiskeysockets/baileys';
import fs from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import { CommandContext } from '../commands/types';

export async function processAudioEffect(
  ctx: CommandContext,
  ffmpegFilters: string[] | ((command: any) => void),
  outputFormat: 'mp3' | 'ogg' = 'mp3',
  isPtt: boolean = false
): Promise<void> {
  const tmpDir = path.join(process.cwd(), 'tmp');
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }

  const msgToDownload = ctx.quoted?.message ? ctx.quoted : ctx.message;
  if (!msgToDownload) {
    await ctx.reply('❌ Please reply to an audio or video message to apply this effect.');
    return;
  }

  const content = msgToDownload.message || msgToDownload;
  const isMedia =
    content.audioMessage ||
    content.videoMessage ||
    content.documentMessage ||
    content.extendedTextMessage?.contextInfo?.quotedMessage?.audioMessage ||
    content.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage;

  if (!isMedia) {
    await ctx.reply('❌ Please reply to an audio or video message!');
    return;
  }

  await ctx.reply('⏳ Processing audio effect, please wait...');

  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  const inputPath = path.join(tmpDir, `input_${timestamp}_${random}.tmp`);
  const outputPath = path.join(tmpDir, `output_${timestamp}_${random}.${outputFormat}`);

  try {
    let buffer: Buffer | null = null;
    if (ctx.client && typeof ctx.client.downloadMediaMessage === 'function') {
      try {
        buffer = await ctx.client.downloadMediaMessage(msgToDownload);
      } catch {
        buffer = null;
      }
    }
    
    if (!buffer) {
      buffer = (await downloadMediaMessage(
        msgToDownload,
        'buffer',
        {},
        { logger: undefined as any, reuploadRequest: async (msg: any) => msg }
      )) as Buffer;
    }

    if (!buffer || buffer.length === 0) {
      await ctx.reply('❌ Failed to download media from message.');
      return;
    }

    fs.writeFileSync(inputPath, buffer);

    await new Promise<void>((resolve, reject) => {
      let command = ffmpeg(inputPath);

      if (typeof ffmpegFilters === 'function') {
        ffmpegFilters(command);
      } else if (Array.isArray(ffmpegFilters)) {
        command = command.audioFilters(ffmpegFilters);
      }

      if (outputFormat === 'mp3') {
        command.toFormat('mp3').audioCodec('libmp3lame');
      } else if (outputFormat === 'ogg') {
        command.toFormat('ogg').audioCodec('libopus');
      }

      command
        .on('end', () => resolve())
        .on('error', (err: Error) => reject(err))
        .save(outputPath);
    });

    const outputBuffer = fs.readFileSync(outputPath);

    if (isPtt) {
      await ctx.client.sendMessage(
        ctx.jid,
        {
          audio: outputBuffer,
          mimetype: 'audio/ogg; codecs=opus',
          ptt: true,
        },
        { quoted: ctx.message }
      );
    } else if (ctx.replyMedia) {
      const mime = outputFormat === 'ogg' ? 'audio/ogg' : 'audio/mp3';
      await ctx.replyMedia(outputBuffer, mime);
    } else {
      await ctx.client.sendMessage(
        ctx.jid,
        {
          audio: outputBuffer,
          mimetype: outputFormat === 'ogg' ? 'audio/ogg' : 'audio/mp3',
        },
        { quoted: ctx.message }
      );
    }
  } catch (err: any) {
    await ctx.reply(`❌ Audio processing error: ${err.message || err}`);
  } finally {
    if (fs.existsSync(inputPath)) {
      try { fs.unlinkSync(inputPath); } catch {}
    }
    if (fs.existsSync(outputPath)) {
      try { fs.unlinkSync(outputPath); } catch {}
    }
  }
}
