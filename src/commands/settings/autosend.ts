import { CommandContext } from '../types';
import { db } from '../../database';

export default {
  name: 'autosend',
  alias: [],
  category: 'Settings',
  description: 'Toggle auto send',
  usage: '.autosend on/off',
  permission: 4,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const arg = ctx.args[0]?.toLowerCase();
    if (!arg) {
      const status = db.getSetting('autosend', 'false') === 'true';
      await ctx.reply(`Toggle auto send: ${status ? '✅ ON' : '❌ OFF'}`);
      return;
    }
    if (arg !== 'on' && arg !== 'off') { await ctx.reply('Usage: .autosend on/off'); return; }
    db.setSetting('autosend', arg === 'on' ? 'true' : 'false');
    await ctx.reply(`✅ Toggle auto send: ${arg.toUpperCase()}`);
  },
};
