import { CommandContext } from '../types';

export default {
  name: 'device',
  alias: ['devicetype', 'clientdevice'],
  category: 'tools',
  description: 'Identify device platform from quoted message',
  usage: 'device (reply to a message)',
  permission: 0,
  cooldown: 2,
  handler: async (ctx: CommandContext) => {
    if (!ctx.quoted) {
      return await ctx.reply('⚠️ Please reply to a message to detect the sender\'s device type.');
    }

    const msgId = ctx.quoted.key?.id || '';
    let deviceType = 'Android / Standard WhatsApp';

    if (msgId.startsWith('3EB0')) {
      deviceType = 'WhatsApp Web / Desktop';
    } else if (msgId.startsWith('3A')) {
      deviceType = 'iOS (iPhone / iPad)';
    } else if (msgId.startsWith('BAE5') || msgId.length === 16) {
      deviceType = 'WhatsApp Bot / Baileys';
    } else if (msgId.length === 32) {
      deviceType = 'Android';
    }

    await ctx.reply(`📱 *DEVICE IDENTIFIER*\n\n🆔 *Message ID:* \`${msgId}\`\n📲 *Detected Platform:* *${deviceType}*`);
  },
};
