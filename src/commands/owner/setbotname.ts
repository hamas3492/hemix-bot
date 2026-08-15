import { CommandContext } from '../types'; import { db } from '../../database'; import { config } from '../../config';
export default {
  name: 'setbotname', alias: ['setname'], category: 'Owner', description: 'Set bot display name', usage: '.setbotname <name>', permission: 4, cooldown: 5,
  handler: async (ctx: CommandContext) => {
    if (!ctx.text) { await ctx.reply('Usage: .setbotname <name>'); return; }
    db.setSetting('botName', ctx.text); config.botName = ctx.text;
    await ctx.reply(`✅ Bot name set to: ${ctx.text}`);
  },
};
