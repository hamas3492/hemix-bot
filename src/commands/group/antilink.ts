import { CommandContext } from '../types';
import { db } from '../../database';

export default {
  name: 'antilink',
  alias: [],
  category: 'Group',
  description: 'Toggle antilink',
  usage: '.antilink on/off',
  permission: 2,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    if (!ctx.isGroup) { await ctx.reply('❌ Group only!'); return; }
    const arg = ctx.args[0]?.toLowerCase();
    if (!arg) {
      const status = db.getGroupSetting(ctx.jid, 'antilink') === 'true';
      await ctx.reply(`Toggle antilink: ${status ? '✅ ON' : '❌ OFF'}`); return;
    }
    if (arg !== 'on' && arg !== 'off') { await ctx.reply('Usage: .antilink on/off'); return; }
    db.setGroupSetting(ctx.jid, 'antilink', arg === 'on' ? 'true' : 'false');
    await ctx.reply(`✅ Toggle antilink: ${arg.toUpperCase()}`);
  },
};
