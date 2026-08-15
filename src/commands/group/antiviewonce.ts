import { CommandContext } from '../types';
import { db } from '../../database';

export default {
  name: 'antiviewonce',
  alias: [],
  category: 'Group',
  description: 'Toggle antiviewonce',
  usage: '.antiviewonce on/off',
  permission: 2,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    if (!ctx.isGroup) { await ctx.reply('❌ Group only!'); return; }
    const arg = ctx.args[0]?.toLowerCase();
    if (!arg) {
      const status = db.getGroupSetting(ctx.jid, 'antiviewonce') === 'true';
      await ctx.reply(`Toggle antiviewonce: ${status ? '✅ ON' : '❌ OFF'}`); return;
    }
    if (arg !== 'on' && arg !== 'off') { await ctx.reply('Usage: .antiviewonce on/off'); return; }
    db.setGroupSetting(ctx.jid, 'antiviewonce', arg === 'on' ? 'true' : 'false');
    await ctx.reply(`✅ Toggle antiviewonce: ${arg.toUpperCase()}`);
  },
};
