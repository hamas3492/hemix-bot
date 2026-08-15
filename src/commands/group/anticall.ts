import { CommandContext } from '../types';
import { db } from '../../database';

export default {
  name: 'anticall',
  alias: [],
  category: 'Group',
  description: 'Toggle anticall',
  usage: '.anticall on/off',
  permission: 2,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    if (!ctx.isGroup) { await ctx.reply('❌ Group only!'); return; }
    const arg = ctx.args[0]?.toLowerCase();
    if (!arg) {
      const status = db.getGroupSetting(ctx.jid, 'anticall') === 'true';
      await ctx.reply(`Toggle anticall: ${status ? '✅ ON' : '❌ OFF'}`); return;
    }
    if (arg !== 'on' && arg !== 'off') { await ctx.reply('Usage: .anticall on/off'); return; }
    db.setGroupSetting(ctx.jid, 'anticall', arg === 'on' ? 'true' : 'false');
    await ctx.reply(`✅ Toggle anticall: ${arg.toUpperCase()}`);
  },
};
