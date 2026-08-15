import { CommandContext } from '../types';
import { db } from '../../database';

export default {
  name: 'antitagadmin',
  alias: [],
  category: 'Group',
  description: 'Toggle antitagadmin',
  usage: '.antitagadmin on/off',
  permission: 2,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    if (!ctx.isGroup) { await ctx.reply('❌ Group only!'); return; }
    const arg = ctx.args[0]?.toLowerCase();
    if (!arg) {
      const status = db.getGroupSetting(ctx.jid, 'antitagadmin') === 'true';
      await ctx.reply(`Toggle antitagadmin: ${status ? '✅ ON' : '❌ OFF'}`); return;
    }
    if (arg !== 'on' && arg !== 'off') { await ctx.reply('Usage: .antitagadmin on/off'); return; }
    db.setGroupSetting(ctx.jid, 'antitagadmin', arg === 'on' ? 'true' : 'false');
    await ctx.reply(`✅ Toggle antitagadmin: ${arg.toUpperCase()}`);
  },
};
