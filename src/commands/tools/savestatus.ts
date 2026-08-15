import { CommandContext } from '../types';
import { downloadMediaMessage } from '@whiskeysockets/baileys';

export default {
  name: 'savestatus',
  alias: ['downloadstatus', 'savestory'],
  category: 'tools',
  description: 'Save status / story media to chat',
  usage: 'savestatus (reply to status)',
  permission: 0,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    if (!ctx.quoted) {
      return await ctx.reply('⚠️ Please reply to a WhatsApp status/story update to save it.');
    }

    try {
      const buffer = await downloadMediaMessage(
        ctx.quoted,
        'buffer',
        {},
        { logger: undefined as any, reuploadRequest: (async () => {}) as any }
      );

      if (buffer) {
        await ctx.client.sendMessage(ctx.sender, { image: buffer, caption: '📥 *Status Saved Successfully!*' });
        await ctx.reply('✅ Status media sent to your private chat!');
      } else {
        await ctx.reply('❌ Could not download status media.');
      }
    } catch (err) {
      await ctx.reply(`❌ Error saving status: ${(err as Error).message}`);
    }
  },
};
