import { CommandContext } from '../types';
import { db } from '../../database';
export default {
  name: 'editsettings', alias: ['edits'], category: 'Settings', description: 'Edit settings', usage: '.editsettings <key> <value>', permission: 4, cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const key = ctx.args[0]; const value = ctx.args.slice(1).join(' ');
    if (!key || !value) { await ctx.reply('Usage: .editsettings <key> <value>'); return; }
    db.setSetting(key, value); await ctx.reply(`✅ Setting '${key}' = '${value}'`);
  },
};
