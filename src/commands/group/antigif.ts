import { CommandContext } from '../types';
import { db } from '../../database';

export default {
  name: 'antigif',
  alias: [],
  category: 'Group',
  description: 'Toggle antigif',
  usage: '.antigif on/off',
  permission: 2,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    if (!ctx.isGroup) { await ctx.reply('❌ Group only!'); return; }
    const arg = ctx.args[0]?.toLowerCase();
    if (!arg) {
      const status = db.getGroupSetting(ctx.jid, 'antigif') === 'true';
      await ctx.reply(`Toggle antigif: ${status ? '✅ ON' : '❌ OFF'}`); return;
    }
    if (arg !== 'on' && arg !== 'off') { await ctx.reply('Usage: .antigif on/off'); return; }
    db.setGroupSetting(ctx.jid, 'antigif', arg === 'on' ? 'true' : 'false');
    await ctx.reply(`✅ Toggle antigif: ${arg.toUpperCase()}`);
  },
};
