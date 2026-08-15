import { CommandContext } from '../types';
import { checkPermission, PermissionLevel } from '../../utils/permissions';

export default {
  name: 'chatbot',
  alias: ['aichat', 'autochat', 'chatgpt'],
  category: 'ai',
  description: 'Toggle chatbot auto-reply for the current chat',
  usage: '.chatbot <on|off|status>',
  permission: 1,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    // Permission check for groups: admin required
    if (ctx.isGroup) {
      const isAdmin = checkPermission(ctx.sender, PermissionLevel.GROUP_ADMIN, {
        isGroup: ctx.isGroup,
        groupMetadata: ctx.groupMetadata,
        db: ctx.db,
      });

      if (!isAdmin) {
        await ctx.reply('❌ Only group admins can enable/disable the chatbot in groups.');
        return;
      }
    }

    const action = ctx.args[0]?.toLowerCase();

    if (action === 'on' || action === 'enable' || action === '1') {
      ctx.db.setChatbotState(ctx.jid, true);
      await ctx.reply('🤖 *Chatbot Enabled!* AI auto-reply is now active for this chat.');
    } else if (action === 'off' || action === 'disable' || action === '0') {
      ctx.db.setChatbotState(ctx.jid, false);
      await ctx.reply('🤖 *Chatbot Disabled!* AI auto-reply is now turned off for this chat.');
    } else {
      const currentState = ctx.db.getChatbotState(ctx.jid);
      const statusText = currentState ? 'ENABLED ✅' : 'DISABLED ❌';
      await ctx.reply(
        `🤖 *Chatbot Status:* ${statusText}\n\n` +
          `*Usage:*\n` +
          `• \`${ctx.config.botPrefix || '.'}chatbot on\` - Turn ON auto-reply\n` +
          `• \`${ctx.config.botPrefix || '.'}chatbot off\` - Turn OFF auto-reply`
      );
    }
  },
};
