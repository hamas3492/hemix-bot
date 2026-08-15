import { CommandContext } from '../types';
import { db } from '../../database';

export default {
  name: 'antimessage',
  alias: [],
  category: 'Group',
  description: 'Toggle antimessage',
  usage: '.antimessage on/off',
  permission: 2,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    if (!ctx.isGroup) { await ctx.reply('❌ Group only!'); return; }
    const arg = ctx.args[0]?.toLowerCase();
    if (!arg) {
      const status = db.getGroupSetting(ctx.jid, 'antimessage') === 'true';
      await ctx.reply(`Toggle antimessage: ${status ? '✅ ON' : '❌ OFF'}`); return;
    }
    if (arg !== 'on' && arg !== 'off') { await ctx.reply('Usage: .antimessage on/off'); return; }
    db.setGroupSetting(ctx.jid, 'antimessage', arg === 'on' ? 'true' : 'false');
    await ctx.reply(`✅ Toggle antimessage: ${arg.toUpperCase()}`);
  },
};
