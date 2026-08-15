import { CommandContext } from '../types';
import { db } from '../../database';
export default {
  name: 'enable', alias: [], category: 'Settings', description: 'Enable a feature', usage: '.enable <feature>', permission: 4, cooldown: 3,
  handler: async (ctx: CommandContext) => {
    if (!ctx.text) { await ctx.reply('Usage: .enable <feature>'); return; }
    db.setSetting(ctx.text, 'true'); await ctx.reply(`✅ Feature '${ctx.text}' enabled!`);
  },
};
