import { CommandContext } from '../types';
import { db } from '../../database';

export default {
  name: 'antibug',
  alias: [],
  category: 'Group',
  description: 'Toggle antibug',
  usage: '.antibug on/off',
  permission: 2,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    if (!ctx.isGroup) { await ctx.reply('❌ Group only!'); return; }
    const arg = ctx.args[0]?.toLowerCase();
    if (!arg) {
      const status = db.getGroupSetting(ctx.jid, 'antibug') === 'true';
      await ctx.reply(`Toggle antibug: ${status ? '✅ ON' : '❌ OFF'}`); return;
    }
    if (arg !== 'on' && arg !== 'off') { await ctx.reply('Usage: .antibug on/off'); return; }
    db.setGroupSetting(ctx.jid, 'antibug', arg === 'on' ? 'true' : 'false');
    await ctx.reply(`✅ Toggle antibug: ${arg.toUpperCase()}`);
  },
};
