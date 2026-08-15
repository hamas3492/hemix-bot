import { CommandContext } from '../types'; import { db } from '../../database'; import { config } from '../../config';
export default {
  name: 'setownername', alias: [], category: 'Owner', description: 'Set owner name', usage: '.setownername <name>', permission: 4, cooldown: 3,
  handler: async (ctx: CommandContext) => {
    if (!ctx.text) { await ctx.reply('Usage: .setownername <name>'); return; }
    db.setSetting('ownerName', ctx.text); config.ownerName = ctx.text;
    await ctx.reply(`✅ Owner name set to: ${ctx.text}`);
  },
};
