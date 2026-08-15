import { CommandContext } from '../types';
import { db } from '../../database';

export default {
  name: 'antivideo',
  alias: [],
  category: 'Group',
  description: 'Toggle antivideo',
  usage: '.antivideo on/off',
  permission: 2,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    if (!ctx.isGroup) { await ctx.reply('❌ Group only!'); return; }
    const arg = ctx.args[0]?.toLowerCase();
    if (!arg) {
      const status = db.getGroupSetting(ctx.jid, 'antivideo') === 'true';
      await ctx.reply(`Toggle antivideo: ${status ? '✅ ON' : '❌ OFF'}`); return;
    }
    if (arg !== 'on' && arg !== 'off') { await ctx.reply('Usage: .antivideo on/off'); return; }
    db.setGroupSetting(ctx.jid, 'antivideo', arg === 'on' ? 'true' : 'false');
    await ctx.reply(`✅ Toggle antivideo: ${arg.toUpperCase()}`);
  },
};
