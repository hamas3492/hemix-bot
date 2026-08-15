import { CommandContext } from '../types';
import { db } from '../../database';

export default {
  name: 'antibadword',
  alias: [],
  category: 'Group',
  description: 'Toggle antibadword',
  usage: '.antibadword on/off',
  permission: 2,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    if (!ctx.isGroup) { await ctx.reply('❌ Group only!'); return; }
    const arg = ctx.args[0]?.toLowerCase();
    if (!arg) {
      const status = db.getGroupSetting(ctx.jid, 'antibadword') === 'true';
      await ctx.reply(`Toggle antibadword: ${status ? '✅ ON' : '❌ OFF'}`); return;
    }
    if (arg !== 'on' && arg !== 'off') { await ctx.reply('Usage: .antibadword on/off'); return; }
    db.setGroupSetting(ctx.jid, 'antibadword', arg === 'on' ? 'true' : 'false');
    await ctx.reply(`✅ Toggle antibadword: ${arg.toUpperCase()}`);
  },
};
