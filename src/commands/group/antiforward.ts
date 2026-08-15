import { CommandContext } from '../types';
import { db } from '../../database';

export default {
  name: 'antiforward',
  alias: [],
  category: 'Group',
  description: 'Toggle antiforward',
  usage: '.antiforward on/off',
  permission: 2,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    if (!ctx.isGroup) { await ctx.reply('❌ Group only!'); return; }
    const arg = ctx.args[0]?.toLowerCase();
    if (!arg) {
      const status = db.getGroupSetting(ctx.jid, 'antiforward') === 'true';
      await ctx.reply(`Toggle antiforward: ${status ? '✅ ON' : '❌ OFF'}`); return;
    }
    if (arg !== 'on' && arg !== 'off') { await ctx.reply('Usage: .antiforward on/off'); return; }
    db.setGroupSetting(ctx.jid, 'antiforward', arg === 'on' ? 'true' : 'false');
    await ctx.reply(`✅ Toggle antiforward: ${arg.toUpperCase()}`);
  },
};
