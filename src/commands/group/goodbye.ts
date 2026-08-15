import { CommandContext } from '../types'; import { db } from '../../database';
export default {
  name: 'goodbye', alias: ['bye'], category: 'Group', description: 'Toggle goodbye messages', usage: '.goodbye on/off', permission: 2, cooldown: 3,
  handler: async (ctx: CommandContext) => {
    if (!ctx.isGroup) { await ctx.reply('❌ Group only!'); return; }
    const arg = ctx.args[0]?.toLowerCase();
    if (!arg) { const status = db.getGroupSetting(ctx.jid, 'goodbye') === 'true'; await ctx.reply(`Goodbye: ${status ? '✅ ON' : '❌ OFF'}`); return; }
    db.setGroupSetting(ctx.jid, 'goodbye', arg === 'on' ? 'true' : 'false');
    await ctx.reply(`✅ Goodbye: ${arg.toUpperCase()}`);
  },
};
