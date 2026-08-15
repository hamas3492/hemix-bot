import { CommandContext } from '../types';
import { db } from '../../database';

export default {
  name: 'antiimage',
  alias: [],
  category: 'Group',
  description: 'Toggle antiimage',
  usage: '.antiimage on/off',
  permission: 2,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    if (!ctx.isGroup) { await ctx.reply('❌ Group only!'); return; }
    const arg = ctx.args[0]?.toLowerCase();
    if (!arg) {
      const status = db.getGroupSetting(ctx.jid, 'antiimage') === 'true';
      await ctx.reply(`Toggle antiimage: ${status ? '✅ ON' : '❌ OFF'}`); return;
    }
    if (arg !== 'on' && arg !== 'off') { await ctx.reply('Usage: .antiimage on/off'); return; }
    db.setGroupSetting(ctx.jid, 'antiimage', arg === 'on' ? 'true' : 'false');
    await ctx.reply(`✅ Toggle antiimage: ${arg.toUpperCase()}`);
  },
};
