import { CommandContext } from '../types';
import { db } from '../../database';

export default {
  name: 'autoreactstatus',
  alias: ['areacts'],
  category: 'Settings',
  description: 'Toggle auto react to status',
  usage: '.autoreactstatus on/off',
  permission: 4,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const arg = ctx.args[0]?.toLowerCase();
    if (!arg) {
      const status = db.getSetting('autoreactstatus', 'false') === 'true';
      await ctx.reply(`Toggle auto react to status: ${status ? '✅ ON' : '❌ OFF'}`);
      return;
    }
    if (arg !== 'on' && arg !== 'off') { await ctx.reply('Usage: .autoreactstatus on/off'); return; }
    db.setSetting('autoreactstatus', arg === 'on' ? 'true' : 'false');
    await ctx.reply(`✅ Toggle auto react to status: ${arg.toUpperCase()}`);
  },
};
