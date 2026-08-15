import { CommandContext } from '../types';
import { db } from '../../database';

export default {
  name: 'autoread',
  alias: ['aread'],
  category: 'Settings',
  description: 'Toggle auto read messages',
  usage: '.autoread on/off',
  permission: 4,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const arg = ctx.args[0]?.toLowerCase();
    if (!arg) {
      const status = db.getSetting('autoread', 'false') === 'true';
      await ctx.reply(`Toggle auto read messages: ${status ? '✅ ON' : '❌ OFF'}`);
      return;
    }
    if (arg !== 'on' && arg !== 'off') { await ctx.reply('Usage: .autoread on/off'); return; }
    db.setSetting('autoread', arg === 'on' ? 'true' : 'false');
    await ctx.reply(`✅ Toggle auto read messages: ${arg.toUpperCase()}`);
  },
};
