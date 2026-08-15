import { CommandContext } from '../types';
import { db } from '../../database';

export default {
  name: 'autoviewstatus',
  alias: ['aviewstatus'],
  category: 'Settings',
  description: 'Toggle auto view status',
  usage: '.autoviewstatus on/off',
  permission: 4,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const arg = ctx.args[0]?.toLowerCase();
    if (!arg) {
      const status = db.getSetting('autoviewstatus', 'false') === 'true';
      await ctx.reply(`Toggle auto view status: ${status ? '✅ ON' : '❌ OFF'}`);
      return;
    }
    if (arg !== 'on' && arg !== 'off') { await ctx.reply('Usage: .autoviewstatus on/off'); return; }
    db.setSetting('autoviewstatus', arg === 'on' ? 'true' : 'false');
    await ctx.reply(`✅ Toggle auto view status: ${arg.toUpperCase()}`);
  },
};
