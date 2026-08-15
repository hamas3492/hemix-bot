import { CommandContext } from '../types';
export default {
  name: 'testwelcome', alias: [], category: 'Group', description: 'Test welcome message', usage: '.testwelcome', permission: 2, cooldown: 5,
  handler: async (ctx: CommandContext) => {
    const msg = ctx.db.getGroupSetting(ctx.jid, 'welcome_msg') || '👋 Welcome @user!';
    const formatted = msg.replace('{user}', '@Test').replace('{group}', ctx.groupMetadata?.subject || 'Group').replace('{count}', String(ctx.groupMetadata?.participants?.length || 0));
    await ctx.reply(`📝 *Test Welcome:*\n\n${formatted}`);
  },
};
