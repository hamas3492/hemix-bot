import { CommandContext } from '../types';

export default {
  name: 'mediatag',
  alias: ['tagmedia', 'inspectmedia'],
  category: 'tools',
  description: 'Tag and inspect details of media message',
  usage: 'mediatag (reply to image/video/audio)',
  permission: 0,
  cooldown: 2,
  handler: async (ctx: CommandContext) => {
    if (!ctx.quoted) {
      return await ctx.reply('⚠️ Reply to a media message (image, video, audio, document) to inspect tags!');
    }

    const qMsg = ctx.quoted.message || ctx.quoted;
    let mediaType = 'Unknown';
    let mime = 'Unknown';
    let size = 'Unknown';

    if (qMsg.imageMessage) {
      mediaType = '📷 Image';
      mime = qMsg.imageMessage.mimetype || 'image/jpeg';
      size = qMsg.imageMessage.fileLength ? `${(qMsg.imageMessage.fileLength / 1024).toFixed(1)} KB` : 'N/A';
    } else if (qMsg.videoMessage) {
      mediaType = '🎥 Video';
      mime = qMsg.videoMessage.mimetype || 'video/mp4';
      size = qMsg.videoMessage.fileLength ? `${(qMsg.videoMessage.fileLength / (1024 * 1024)).toFixed(1)} MB` : 'N/A';
    } else if (qMsg.audioMessage) {
      mediaType = '🎵 Audio / Voice Note';
      mime = qMsg.audioMessage.mimetype || 'audio/ogg';
      size = qMsg.audioMessage.fileLength ? `${(qMsg.audioMessage.fileLength / 1024).toFixed(1)} KB` : 'N/A';
    } else if (qMsg.stickerMessage) {
      mediaType = '🎨 Sticker';
      mime = 'image/webp';
    } else if (qMsg.documentMessage) {
      mediaType = '📄 Document';
      mime = qMsg.documentMessage.mimetype || 'application/octet-stream';
      size = qMsg.documentMessage.fileLength ? `${(qMsg.documentMessage.fileLength / 1024).toFixed(1)} KB` : 'N/A';
    }

    await ctx.reply(`🏷️ *MEDIA METADATA & TAGS*\n\n📂 *Type:* ${mediaType}\n📄 *MIME:* \`${mime}\`\n📏 *Estimated Size:* ${size}`);
  },
};
