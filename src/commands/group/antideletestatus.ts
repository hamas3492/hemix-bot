import { CommandContext } from '../types';
import { db } from '../../database';

export default {
  name: 'antideletestatus',
  alias: [],
  category: 'Group',
  description: 'Toggle antideletestatus',
  usage: '.antideletestatus on/off',
  permission: 2,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    if (!ctx.isGroup) { await ctx.reply('❌ Group only!'); return; }
    const arg = ctx.args[0]?.toLowerCase();
    if (!arg) {
      const status = db.getGroupSetting(ctx.jid, 'antideletestatus') === 'true';
      await ctx.reply(`Toggle antideletestatus: ${status ? '✅ ON' : '❌ OFF'}`); return;
    }
    if (arg !== 'on' && arg !== 'off') { await ctx.reply('Usage: .antideletestatus on/off'); return; }
    db.setGroupSetting(ctx.jid, 'antideletestatus', arg === 'on' ? 'true' : 'false');
    await ctx.reply(`✅ Toggle antideletestatus: ${arg.toUpperCase()}`);
  },
};
