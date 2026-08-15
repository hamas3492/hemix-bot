import { CommandContext } from '../types';
import { db } from '../../database';

export default {
  name: 'autorecordtyping',
  alias: [],
  category: 'Settings',
  description: 'Toggle auto record typing',
  usage: '.autorecordtyping on/off',
  permission: 4,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const arg = ctx.args[0]?.toLowerCase();
    if (!arg) {
      const status = db.getSetting('autorecordtyping', 'false') === 'true';
      await ctx.reply(`Toggle auto record typing: ${status ? '✅ ON' : '❌ OFF'}`);
      return;
    }
    if (arg !== 'on' && arg !== 'off') { await ctx.reply('Usage: .autorecordtyping on/off'); return; }
    db.setSetting('autorecordtyping', arg === 'on' ? 'true' : 'false');
    await ctx.reply(`✅ Toggle auto record typing: ${arg.toUpperCase()}`);
  },
};
