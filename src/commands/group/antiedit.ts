import { CommandContext } from '../types';
import { db } from '../../database';

export default {
  name: 'antiedit',
  alias: [],
  category: 'Group',
  description: 'Toggle antiedit',
  usage: '.antiedit on/off',
  permission: 2,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    if (!ctx.isGroup) { await ctx.reply('❌ Group only!'); return; }
    const arg = ctx.args[0]?.toLowerCase();
    if (!arg) {
      const status = db.getGroupSetting(ctx.jid, 'antiedit') === 'true';
      await ctx.reply(`Toggle antiedit: ${status ? '✅ ON' : '❌ OFF'}`); return;
    }
    if (arg !== 'on' && arg !== 'off') { await ctx.reply('Usage: .antiedit on/off'); return; }
    db.setGroupSetting(ctx.jid, 'antiedit', arg === 'on' ? 'true' : 'false');
    await ctx.reply(`✅ Toggle antiedit: ${arg.toUpperCase()}`);
  },
};
