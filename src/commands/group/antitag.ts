import { CommandContext } from '../types';
import { db } from '../../database';

export default {
  name: 'antitag',
  alias: [],
  category: 'Group',
  description: 'Toggle antitag',
  usage: '.antitag on/off',
  permission: 2,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    if (!ctx.isGroup) { await ctx.reply('❌ Group only!'); return; }
    const arg = ctx.args[0]?.toLowerCase();
    if (!arg) {
      const status = db.getGroupSetting(ctx.jid, 'antitag') === 'true';
      await ctx.reply(`Toggle antitag: ${status ? '✅ ON' : '❌ OFF'}`); return;
    }
    if (arg !== 'on' && arg !== 'off') { await ctx.reply('Usage: .antitag on/off'); return; }
    db.setGroupSetting(ctx.jid, 'antitag', arg === 'on' ? 'true' : 'false');
    await ctx.reply(`✅ Toggle antitag: ${arg.toUpperCase()}`);
  },
};
