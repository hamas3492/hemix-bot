import { CommandContext } from '../types'; import { db } from '../../database';
export default {
  name: 'setvar', alias: [], category: 'Owner', description: 'Set a variable', usage: '.setvar <key> <value>', permission: 4, cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const key = ctx.args[0]; const value = ctx.args.slice(1).join(' ');
    if (!key || !value) { await ctx.reply('Usage: .setvar <key> <value>'); return; }
    db.setVariable(key, value); await ctx.reply(`✅ ${key} = ${value}`);
  },
};
