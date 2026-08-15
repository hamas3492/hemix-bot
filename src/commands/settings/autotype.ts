import { CommandContext } from '../types';
import { db } from '../../database';

export default {
  name: 'autotype',
  alias: ['atype'],
  category: 'Settings',
  description: 'Toggle auto typing indicator',
  usage: '.autotype on/off',
  permission: 4,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const arg = ctx.args[0]?.toLowerCase();
    if (!arg) {
      const status = db.getSetting('autotype', 'false') === 'true';
      await ctx.reply(`Toggle auto typing indicator: ${status ? '✅ ON' : '❌ OFF'}`);
      return;
    }
    if (arg !== 'on' && arg !== 'off') { await ctx.reply('Usage: .autotype on/off'); return; }
    db.setSetting('autotype', arg === 'on' ? 'true' : 'false');
    await ctx.reply(`✅ Toggle auto typing indicator: ${arg.toUpperCase()}`);
  },
};
