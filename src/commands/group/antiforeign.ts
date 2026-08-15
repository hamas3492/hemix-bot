import { CommandContext } from '../types';
import { db } from '../../database';

export default {
  name: 'antiforeign',
  alias: [],
  category: 'Group',
  description: 'Toggle antiforeign',
  usage: '.antiforeign on/off',
  permission: 2,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    if (!ctx.isGroup) { await ctx.reply('❌ Group only!'); return; }
    const arg = ctx.args[0]?.toLowerCase();
    if (!arg) {
      const status = db.getGroupSetting(ctx.jid, 'antiforeign') === 'true';
      await ctx.reply(`Toggle antiforeign: ${status ? '✅ ON' : '❌ OFF'}`); return;
    }
    if (arg !== 'on' && arg !== 'off') { await ctx.reply('Usage: .antiforeign on/off'); return; }
    db.setGroupSetting(ctx.jid, 'antiforeign', arg === 'on' ? 'true' : 'false');
    await ctx.reply(`✅ Toggle antiforeign: ${arg.toUpperCase()}`);
  },
};
