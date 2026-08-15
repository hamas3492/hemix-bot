import { CommandContext } from '../types'; import { db } from '../../database'; import { config } from '../../config';
export default {
  name: 'setownernumber', alias: [], category: 'Owner', description: 'Set owner number', usage: '.setownernumber <number>', permission: 4, cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const num = ctx.args[0]?.replace(/[^0-9]/g, '');
    if (!num) { await ctx.reply('Usage: .setownernumber <number>'); return; }
    db.setSetting('ownerNumber', num); config.ownerNumber = num;
    await ctx.reply(`✅ Owner number set to: ${num}`);
  },
};
