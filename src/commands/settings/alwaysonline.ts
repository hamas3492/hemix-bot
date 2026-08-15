import { CommandContext } from '../types';
import { db } from '../../database';

export default {
  name: 'alwaysonline',
  alias: ['online'],
  category: 'Settings',
  description: 'Toggle always online',
  usage: '.alwaysonline on/off',
  permission: 4,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const arg = ctx.args[0]?.toLowerCase();
    if (!arg) {
      const status = db.getSetting('alwaysonline', 'false') === 'true';
      await ctx.reply(`Toggle always online: ${status ? '✅ ON' : '❌ OFF'}`);
      return;
    }
    if (arg !== 'on' && arg !== 'off') { await ctx.reply('Usage: .alwaysonline on/off'); return; }
    db.setSetting('alwaysonline', arg === 'on' ? 'true' : 'false');
    await ctx.reply(`✅ Toggle always online: ${arg.toUpperCase()}`);
  },
};
