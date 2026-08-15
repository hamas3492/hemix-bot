import { CommandContext } from '../types';
import { db } from '../../database';

export default {
  name: 'autoreact',
  alias: ['areact'],
  category: 'Settings',
  description: 'Toggle auto react to messages',
  usage: '.autoreact on/off',
  permission: 4,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const arg = ctx.args[0]?.toLowerCase();
    if (!arg) {
      const status = db.getSetting('autoreact', 'false') === 'true';
      await ctx.reply(`Toggle auto react to messages: ${status ? '✅ ON' : '❌ OFF'}`);
      return;
    }
    if (arg !== 'on' && arg !== 'off') { await ctx.reply('Usage: .autoreact on/off'); return; }
    db.setSetting('autoreact', arg === 'on' ? 'true' : 'false');
    await ctx.reply(`✅ Toggle auto react to messages: ${arg.toUpperCase()}`);
  },
};
