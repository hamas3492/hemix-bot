import { CommandContext } from '../types';
import { db } from '../../database';

export default {
  name: 'antilocation',
  alias: [],
  category: 'Group',
  description: 'Toggle antilocation',
  usage: '.antilocation on/off',
  permission: 2,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    if (!ctx.isGroup) { await ctx.reply('❌ Group only!'); return; }
    const arg = ctx.args[0]?.toLowerCase();
    if (!arg) {
      const status = db.getGroupSetting(ctx.jid, 'antilocation') === 'true';
      await ctx.reply(`Toggle antilocation: ${status ? '✅ ON' : '❌ OFF'}`); return;
    }
    if (arg !== 'on' && arg !== 'off') { await ctx.reply('Usage: .antilocation on/off'); return; }
    db.setGroupSetting(ctx.jid, 'antilocation', arg === 'on' ? 'true' : 'false');
    await ctx.reply(`✅ Toggle antilocation: ${arg.toUpperCase()}`);
  },
};
