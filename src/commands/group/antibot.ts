import { CommandContext } from '../types';
import { db } from '../../database';

export default {
  name: 'antibot',
  alias: [],
  category: 'Group',
  description: 'Toggle antibot',
  usage: '.antibot on/off',
  permission: 2,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    if (!ctx.isGroup) { await ctx.reply('❌ Group only!'); return; }
    const arg = ctx.args[0]?.toLowerCase();
    if (!arg) {
      const status = db.getGroupSetting(ctx.jid, 'antibot') === 'true';
      await ctx.reply(`Toggle antibot: ${status ? '✅ ON' : '❌ OFF'}`); return;
    }
    if (arg !== 'on' && arg !== 'off') { await ctx.reply('Usage: .antibot on/off'); return; }
    db.setGroupSetting(ctx.jid, 'antibot', arg === 'on' ? 'true' : 'false');
    await ctx.reply(`✅ Toggle antibot: ${arg.toUpperCase()}`);
  },
};
