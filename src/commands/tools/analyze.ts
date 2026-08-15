import { CommandContext } from '../types';

export default {
  name: 'analyze',
  alias: ['inspect', 'analyse'],
  category: 'tools',
  description: 'Analyze replied message or provided text content',
  usage: 'analyze <reply to message or text>',
  permission: 0,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    let targetText = ctx.text;
    let isQuoted = false;
    let quotedType = 'text';

    if (ctx.quoted) {
      isQuoted = true;
      const qMsg = ctx.quoted.message || ctx.quoted;
      targetText = qMsg.conversation || qMsg.extendedTextMessage?.text || qMsg.imageMessage?.caption || qMsg.videoMessage?.caption || targetText || '';
      if (qMsg.imageMessage) quotedType = 'image';
      else if (qMsg.videoMessage) quotedType = 'video';
      else if (qMsg.audioMessage) quotedType = 'audio';
      else if (qMsg.stickerMessage) quotedType = 'sticker';
      else if (qMsg.documentMessage) quotedType = 'document';
    }

    if (!targetText && !isQuoted) {
      return await ctx.reply('⚠️ Please reply to a message or provide text to analyze.');
    }

    const charCount = targetText.length;
    const words = targetText.trim() ? targetText.trim().split(/\s+/).length : 0;
    const lines = targetText ? targetText.split('\n').length : 0;
    const uppercaseCount = (targetText.match(/[A-Z]/g) || []).length;
    const lowercaseCount = (targetText.match(/[a-z]/g) || []).length;
    const digitsCount = (targetText.match(/[0-9]/g) || []).length;
    const spacesCount = (targetText.match(/\s/g) || []).length;
    const emojiCount = (targetText.match(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu) || []).length;
    const urls = targetText.match(/https?:\/\/[^\s]+/gi) || [];

    let report = `📊 *CONTENT ANALYSIS REPORT*\n\n`;
    if (isQuoted) report += `📩 *Quoted Media Type:* ${quotedType.toUpperCase()}\n`;
    report += `📝 *Characters:* ${charCount}\n`;
    report += `🔤 *Words:* ${words}\n`;
    report += `📑 *Lines:* ${lines}\n`;
    report += `🔠 *Uppercase Letters:* ${uppercaseCount}\n`;
    report += `🔡 *Lowercase Letters:* ${lowercaseCount}\n`;
    report += `🔢 *Digits:* ${digitsCount}\n`;
    report += `🔲 *Spaces:* ${spacesCount}\n`;
    report += `😀 *Emojis:* ${emojiCount}\n`;
    report += `🔗 *URLs Found:* ${urls.length} ${urls.length > 0 ? `(${urls.join(', ')})` : ''}\n`;

    await ctx.reply(report.trim());
  },
};
