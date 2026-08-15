import { CommandContext } from '../types';
import qrcode from 'qrcode';

export default {
  name: 'qrcode',
  alias: ['qr', 'genqr'],
  category: 'tools',
  description: 'Generate QR code image from text or URL',
  usage: 'qrcode <text or URL>',
  permission: 0,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const input = ctx.text || ctx.args.join(' ');
    if (!input) {
      return await ctx.reply('⚠️ Please provide text or URL to generate QR code.');
    }

    try {
      const buffer = await qrcode.toBuffer(input, { width: 500, margin: 2 });
      if (ctx.replyMedia) {
        await ctx.replyMedia(buffer, 'image/png', `📲 *QR Code generated for:* ${input}`);
      } else {
        await ctx.client.sendMessage(ctx.jid, { image: buffer, caption: `📲 QR Code for: ${input}` }, { quoted: ctx.message });
      }
    } catch (err) {
      await ctx.reply(`❌ Failed to generate QR code: ${(err as Error).message}`);
    }
  },
};
