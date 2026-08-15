import { CommandContext } from '../types';
import { db } from '../../database';

export default {
  name: 'autorecord',
  alias: ['arecord'],
  category: 'Settings',
  description: 'Toggle auto record voice',
  usage: '.autorecord on/off',
  permission: 4,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const arg = ctx.args[0]?.toLowerCase();
    if (!arg) {
      const status = db.getSetting('autorecord', 'false') === 'true';
      await ctx.reply(`Toggle auto record voice: ${status ? '✅ ON' : '❌ OFF'}`);
      return;
    }
    if (arg !== 'on' && arg !== 'off') { await ctx.reply('Usage: .autorecord on/off'); return; }
    db.setSetting('autorecord', arg === 'on' ? 'true' : 'false');
    await ctx.reply(`✅ Toggle auto record voice: ${arg.toUpperCase()}`);
  },
};
