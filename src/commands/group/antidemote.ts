import { CommandContext } from '../types';
import { db } from '../../database';

export default {
  name: 'antidemote',
  alias: [],
  category: 'Group',
  description: 'Toggle antidemote',
  usage: '.antidemote on/off',
  permission: 2,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    if (!ctx.isGroup) { await ctx.reply('❌ Group only!'); return; }
    const arg = ctx.args[0]?.toLowerCase();
    if (!arg) {
      const status = db.getGroupSetting(ctx.jid, 'antidemote') === 'true';
      await ctx.reply(`Toggle antidemote: ${status ? '✅ ON' : '❌ OFF'}`); return;
    }
    if (arg !== 'on' && arg !== 'off') { await ctx.reply('Usage: .antidemote on/off'); return; }
    db.setGroupSetting(ctx.jid, 'antidemote', arg === 'on' ? 'true' : 'false');
    await ctx.reply(`✅ Toggle antidemote: ${arg.toUpperCase()}`);
  },
};
