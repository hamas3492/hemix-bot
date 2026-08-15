import { CommandContext } from '../types';
import { db } from '../../database';

export default {
  name: 'antidocument',
  alias: [],
  category: 'Group',
  description: 'Toggle antidocument',
  usage: '.antidocument on/off',
  permission: 2,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    if (!ctx.isGroup) { await ctx.reply('❌ Group only!'); return; }
    const arg = ctx.args[0]?.toLowerCase();
    if (!arg) {
      const status = db.getGroupSetting(ctx.jid, 'antidocument') === 'true';
      await ctx.reply(`Toggle antidocument: ${status ? '✅ ON' : '❌ OFF'}`); return;
    }
    if (arg !== 'on' && arg !== 'off') { await ctx.reply('Usage: .antidocument on/off'); return; }
    db.setGroupSetting(ctx.jid, 'antidocument', arg === 'on' ? 'true' : 'false');
    await ctx.reply(`✅ Toggle antidocument: ${arg.toUpperCase()}`);
  },
};
