import { CommandContext } from '../types';
import { db } from '../../database';

export default {
  name: 'autobio',
  alias: [],
  category: 'Settings',
  description: 'Toggle auto bio update',
  usage: '.autobio on/off',
  permission: 4,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const arg = ctx.args[0]?.toLowerCase();
    if (!arg) {
      const status = db.getSetting('autobio', 'false') === 'true';
      await ctx.reply(`Toggle auto bio update: ${status ? '✅ ON' : '❌ OFF'}`);
      return;
    }
    if (arg !== 'on' && arg !== 'off') { await ctx.reply('Usage: .autobio on/off'); return; }
    db.setSetting('autobio', arg === 'on' ? 'true' : 'false');
    await ctx.reply(`✅ Toggle auto bio update: ${arg.toUpperCase()}`);
  },
};
