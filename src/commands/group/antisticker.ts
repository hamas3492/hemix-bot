import { CommandContext } from '../types';
import { db } from '../../database';

export default {
  name: 'antisticker',
  alias: [],
  category: 'Group',
  description: 'Toggle antisticker',
  usage: '.antisticker on/off',
  permission: 2,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    if (!ctx.isGroup) { await ctx.reply('❌ Group only!'); return; }
    const arg = ctx.args[0]?.toLowerCase();
    if (!arg) {
      const status = db.getGroupSetting(ctx.jid, 'antisticker') === 'true';
      await ctx.reply(`Toggle antisticker: ${status ? '✅ ON' : '❌ OFF'}`); return;
    }
    if (arg !== 'on' && arg !== 'off') { await ctx.reply('Usage: .antisticker on/off'); return; }
    db.setGroupSetting(ctx.jid, 'antisticker', arg === 'on' ? 'true' : 'false');
    await ctx.reply(`✅ Toggle antisticker: ${arg.toUpperCase()}`);
  },
};
