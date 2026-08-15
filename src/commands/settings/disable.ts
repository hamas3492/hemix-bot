import { CommandContext } from '../types';
import { db } from '../../database';
export default {
  name: 'disable', alias: [], category: 'Settings', description: 'Disable a feature', usage: '.disable <feature>', permission: 4, cooldown: 3,
  handler: async (ctx: CommandContext) => {
    if (!ctx.text) { await ctx.reply('Usage: .disable <feature>'); return; }
    db.setSetting(ctx.text, 'false'); await ctx.reply(`✅ Feature '${ctx.text}' disabled!`);
  },
};
