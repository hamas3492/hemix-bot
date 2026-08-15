import { CommandContext } from '../types';
import { db } from '../../database';

export default {
  name: 'antiaudio',
  alias: [],
  category: 'Group',
  description: 'Toggle antiaudio',
  usage: '.antiaudio on/off',
  permission: 2,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    if (!ctx.isGroup) { await ctx.reply('❌ Group only!'); return; }
    const arg = ctx.args[0]?.toLowerCase();
    if (!arg) {
      const status = db.getGroupSetting(ctx.jid, 'antiaudio') === 'true';
      await ctx.reply(`Toggle antiaudio: ${status ? '✅ ON' : '❌ OFF'}`); return;
    }
    if (arg !== 'on' && arg !== 'off') { await ctx.reply('Usage: .antiaudio on/off'); return; }
    db.setGroupSetting(ctx.jid, 'antiaudio', arg === 'on' ? 'true' : 'false');
    await ctx.reply(`✅ Toggle antiaudio: ${arg.toUpperCase()}`);
  },
};
