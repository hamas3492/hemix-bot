import { CommandContext } from '../types';
import { db } from '../../database';

export default {
  name: 'antipoll',
  alias: [],
  category: 'Group',
  description: 'Toggle antipoll',
  usage: '.antipoll on/off',
  permission: 2,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    if (!ctx.isGroup) { await ctx.reply('❌ Group only!'); return; }
    const arg = ctx.args[0]?.toLowerCase();
    if (!arg) {
      const status = db.getGroupSetting(ctx.jid, 'antipoll') === 'true';
      await ctx.reply(`Toggle antipoll: ${status ? '✅ ON' : '❌ OFF'}`); return;
    }
    if (arg !== 'on' && arg !== 'off') { await ctx.reply('Usage: .antipoll on/off'); return; }
    db.setGroupSetting(ctx.jid, 'antipoll', arg === 'on' ? 'true' : 'false');
    await ctx.reply(`✅ Toggle antipoll: ${arg.toUpperCase()}`);
  },
};
