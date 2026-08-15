import { CommandContext } from '../types';
export default {
  name: 'testgoodbye', alias: [], category: 'Group', description: 'Test goodbye message', usage: '.testgoodbye', permission: 2, cooldown: 5,
  handler: async (ctx: CommandContext) => {
    const msg = ctx.db.getGroupSetting(ctx.jid, 'goodbye_msg') || '👋 Goodbye @user!';
    const formatted = msg.replace('{user}', '@Test').replace('{group}', ctx.groupMetadata?.subject || 'Group');
    await ctx.reply(`📝 *Test Goodbye:*\n\n${formatted}`);
  },
};
