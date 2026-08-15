import { CommandContext } from '../types'; import { db } from '../../database';
export default {
  name: 'getvar', alias: [], category: 'Owner', description: 'Get variable value', usage: '.getvar <key>', permission: 4, cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const key = ctx.args[0]; if (!key) { await ctx.reply('Usage: .getvar <key>'); return; }
    const val = db.getVariable(key);
    await ctx.reply(val ? `📝 ${key} = ${val}` : `❌ Variable '${key}' not found!`);
  },
};
