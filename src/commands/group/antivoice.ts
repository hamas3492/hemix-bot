import { CommandContext } from '../types';
import { db } from '../../database';

export default {
  name: 'antivoice',
  alias: [],
  category: 'Group',
  description: 'Toggle antivoice',
  usage: '.antivoice on/off',
  permission: 2,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    if (!ctx.isGroup) { await ctx.reply('❌ Group only!'); return; }
    const arg = ctx.args[0]?.toLowerCase();
    if (!arg) {
      const status = db.getGroupSetting(ctx.jid, 'antivoice') === 'true';
      await ctx.reply(`Toggle antivoice: ${status ? '✅ ON' : '❌ OFF'}`); return;
    }
    if (arg !== 'on' && arg !== 'off') { await ctx.reply('Usage: .antivoice on/off'); return; }
    db.setGroupSetting(ctx.jid, 'antivoice', arg === 'on' ? 'true' : 'false');
    await ctx.reply(`✅ Toggle antivoice: ${arg.toUpperCase()}`);
  },
};
