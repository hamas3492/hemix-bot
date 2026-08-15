import { CommandContext } from '../types';

export default {
  name: 'announcements',
  alias: ['announce', 'announcement', 'notice'],
  category: 'owner',
  description: 'View/send announcements',
  usage: 'announcements [message|list|clear]',
  permission: 4,
  cooldown: 5,
  handler: async (ctx: CommandContext) => {
    const sub = (ctx.args[0] || '').toLowerCase();

    if (sub === 'list') {
      const currentAnnouncement = ctx.db.getVariable('announcement');
      if (!currentAnnouncement) {
        await ctx.reply('📢 No active announcement set.');
      } else {
        await ctx.reply(`📢 *Current Active Announcement:*\n\n${currentAnnouncement}`);
      }
      return;
    }

    if (sub === 'clear') {
      ctx.db.deleteVariable('announcement');
      await ctx.reply('✅ Active announcement cleared successfully.');
      return;
    }

    if (!ctx.text) {
      await ctx.reply(
        `❌ Please provide an announcement message.\n\n*Usage:*\n• \`${ctx.config.botPrefix}announcements <message>\` - Set announcement\n• \`${ctx.config.botPrefix}announcements list\` - View current\n• \`${ctx.config.botPrefix}announcements clear\` - Clear announcement`
      );
      return;
    }

    ctx.db.setVariable('announcement', ctx.text);
    await ctx.reply(`✅ *Announcement saved successfully!*\n\n📢 *Message:* ${ctx.text}`);
  },
};
