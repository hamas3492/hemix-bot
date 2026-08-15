import { CommandContext } from '../types';
import { db } from '../../database';

export default {
  name: 'antireaction',
  alias: [],
  category: 'Group',
  description: 'Toggle antireaction',
  usage: '.antireaction on/off',
  permission: 2,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    if (!ctx.isGroup) { await ctx.reply('❌ Group only!'); return; }
    const arg = ctx.args[0]?.toLowerCase();
    if (!arg) {
      const status = db.getGroupSetting(ctx.jid, 'antireaction') === 'true';
      await ctx.reply(`Toggle antireaction: ${status ? '✅ ON' : '❌ OFF'}`); return;
    }
    if (arg !== 'on' && arg !== 'off') { await ctx.reply('Usage: .antireaction on/off'); return; }
    db.setGroupSetting(ctx.jid, 'antireaction', arg === 'on' ? 'true' : 'false');
    await ctx.reply(`✅ Toggle antireaction: ${arg.toUpperCase()}`);
  },
};
