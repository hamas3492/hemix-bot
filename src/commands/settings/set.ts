import { CommandContext } from '../types'; import { db } from '../../database';
export default {
  name: 'set', alias: [], category: 'Settings', description: 'Set a setting', usage: '.set <key> <value>', permission: 4, cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const key = ctx.args[0]; const value = ctx.args.slice(1).join(' ');
    if (!key || !value) { await ctx.reply('Usage: .set <key> <value>'); return; }
    db.setSetting(key, value); await ctx.reply(`✅ ${key} = ${value}`);
  },
};
