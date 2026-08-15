import { CommandContext } from '../types';
import { db } from '../../database';

export default {
  name: 'antigroupmention',
  alias: [],
  category: 'Group',
  description: 'Toggle antigroupmention',
  usage: '.antigroupmention on/off',
  permission: 2,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    if (!ctx.isGroup) { await ctx.reply('❌ Group only!'); return; }
    const arg = ctx.args[0]?.toLowerCase();
    if (!arg) {
      const status = db.getGroupSetting(ctx.jid, 'antigroupmention') === 'true';
      await ctx.reply(`Toggle antigroupmention: ${status ? '✅ ON' : '❌ OFF'}`); return;
    }
    if (arg !== 'on' && arg !== 'off') { await ctx.reply('Usage: .antigroupmention on/off'); return; }
    db.setGroupSetting(ctx.jid, 'antigroupmention', arg === 'on' ? 'true' : 'false');
    await ctx.reply(`✅ Toggle antigroupmention: ${arg.toUpperCase()}`);
  },
};
