import { CommandContext } from '../types';
export default {
  name: 'open', alias: ['opengroup'], category: 'Group', description: 'Open group for all', usage: '.open', permission: 2, cooldown: 5,
  handler: async (ctx: CommandContext) => {
    if (!ctx.isGroup) { await ctx.reply('❌ Group only!'); return; }
    try { await ctx.client.groupSettingUpdate(ctx.jid, 'not_announcement'); await ctx.reply('✅ Group opened! All members can send messages.'); } catch (err: any) { await ctx.reply(`❌ Error: ${err.message}`); }
  },
};
