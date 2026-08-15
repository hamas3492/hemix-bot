import { CommandContext } from '../types';
import { db } from '../../database';

export default {
  name: 'online',
  alias: [],
  category: 'Settings',
  description: 'Toggle online status',
  usage: '.online on/off',
  permission: 4,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const arg = ctx.args[0]?.toLowerCase();
    if (!arg) {
      const status = db.getSetting('online_status', 'false') === 'true';
      await ctx.reply(`Toggle online status: ${status ? '✅ ON' : '❌ OFF'}`);
      return;
    }
    if (arg !== 'on' && arg !== 'off') { await ctx.reply('Usage: .online on/off'); return; }
    db.setSetting('online_status', arg === 'on' ? 'true' : 'false');
    await ctx.reply(`✅ Toggle online status: ${arg.toUpperCase()}`);
  },
};
