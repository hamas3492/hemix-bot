import { CommandContext } from '../types';
import { db } from '../../database';

export default {
  name: 'antidelete',
  alias: [],
  category: 'Group',
  description: 'Toggle antidelete',
  usage: '.antidelete on/off',
  permission: 2,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    if (!ctx.isGroup) { await ctx.reply('❌ Group only!'); return; }
    const arg = ctx.args[0]?.toLowerCase();
    if (!arg) {
      const status = db.getGroupSetting(ctx.jid, 'antidelete') === 'true';
      await ctx.reply(`Toggle antidelete: ${status ? '✅ ON' : '❌ OFF'}`); return;
    }
    if (arg !== 'on' && arg !== 'off') { await ctx.reply('Usage: .antidelete on/off'); return; }
    db.setGroupSetting(ctx.jid, 'antidelete', arg === 'on' ? 'true' : 'false');
    await ctx.reply(`✅ Toggle antidelete: ${arg.toUpperCase()}`);
  },
};
