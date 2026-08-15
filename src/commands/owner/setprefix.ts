import { CommandContext } from '../types'; import { db } from '../../database'; import { config } from '../../config';
export default {
  name: 'setprefix', alias: ['prefix'], category: 'Owner', description: 'Set command prefix', usage: '.setprefix <symbol>', permission: 4, cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const prefix = ctx.args[0]; if (!prefix) { await ctx.reply(`Current prefix: ${config.botPrefix}\nUsage: .setprefix <symbol>`); return; }
    db.setSetting('prefix', prefix); config.botPrefix = prefix;
    await ctx.reply(`✅ Prefix set to: ${prefix}`);
  },
};
