import { CommandContext } from '../types';
import { db } from '../../database';

export default {
  name: 'antichannelpost',
  alias: [],
  category: 'Group',
  description: 'Toggle antichannelpost',
  usage: '.antichannelpost on/off',
  permission: 2,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    if (!ctx.isGroup) { await ctx.reply('❌ Group only!'); return; }
    const arg = ctx.args[0]?.toLowerCase();
    if (!arg) {
      const status = db.getGroupSetting(ctx.jid, 'antichannelpost') === 'true';
      await ctx.reply(`Toggle antichannelpost: ${status ? '✅ ON' : '❌ OFF'}`); return;
    }
    if (arg !== 'on' && arg !== 'off') { await ctx.reply('Usage: .antichannelpost on/off'); return; }
    db.setGroupSetting(ctx.jid, 'antichannelpost', arg === 'on' ? 'true' : 'false');
    await ctx.reply(`✅ Toggle antichannelpost: ${arg.toUpperCase()}`);
  },
};
