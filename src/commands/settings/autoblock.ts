import { CommandContext } from '../types';
import { db } from '../../database';

export default {
  name: 'autoblock',
  alias: [],
  category: 'Settings',
  description: 'Toggle auto block unknown callers',
  usage: '.autoblock on/off',
  permission: 4,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const arg = ctx.args[0]?.toLowerCase();
    if (!arg) {
      const status = db.getSetting('autoblock', 'false') === 'true';
      await ctx.reply(`Toggle auto block unknown callers: ${status ? '✅ ON' : '❌ OFF'}`);
      return;
    }
    if (arg !== 'on' && arg !== 'off') { await ctx.reply('Usage: .autoblock on/off'); return; }
    db.setSetting('autoblock', arg === 'on' ? 'true' : 'false');
    await ctx.reply(`✅ Toggle auto block unknown callers: ${arg.toUpperCase()}`);
  },
};
