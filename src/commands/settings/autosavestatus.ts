import { CommandContext } from '../types';
import { db } from '../../database';

export default {
  name: 'autosavestatus',
  alias: ['asavestatus'],
  category: 'Settings',
  description: 'Toggle auto save status',
  usage: '.autosavestatus on/off',
  permission: 4,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const arg = ctx.args[0]?.toLowerCase();
    if (!arg) {
      const status = db.getSetting('autosavestatus', 'false') === 'true';
      await ctx.reply(`Toggle auto save status: ${status ? '✅ ON' : '❌ OFF'}`);
      return;
    }
    if (arg !== 'on' && arg !== 'off') { await ctx.reply('Usage: .autosavestatus on/off'); return; }
    db.setSetting('autosavestatus', arg === 'on' ? 'true' : 'false');
    await ctx.reply(`✅ Toggle auto save status: ${arg.toUpperCase()}`);
  },
};
