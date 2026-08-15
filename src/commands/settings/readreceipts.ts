import { CommandContext } from '../types';
import { db } from '../../database';

export default {
  name: 'readreceipts',
  alias: [],
  category: 'Settings',
  description: 'Toggle read receipts',
  usage: '.readreceipts on/off',
  permission: 4,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const arg = ctx.args[0]?.toLowerCase();
    if (!arg) {
      const status = db.getSetting('readreceipts', 'false') === 'true';
      await ctx.reply(`Toggle read receipts: ${status ? '✅ ON' : '❌ OFF'}`);
      return;
    }
    if (arg !== 'on' && arg !== 'off') { await ctx.reply('Usage: .readreceipts on/off'); return; }
    db.setSetting('readreceipts', arg === 'on' ? 'true' : 'false');
    await ctx.reply(`✅ Toggle read receipts: ${arg.toUpperCase()}`);
  },
};
