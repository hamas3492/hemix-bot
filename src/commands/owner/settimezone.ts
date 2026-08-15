import { CommandContext } from '../types'; import { db } from '../../database'; import { config } from '../../config';
export default {
  name: 'settimezone', alias: ['tz'], category: 'Owner', description: 'Set timezone', usage: '.settimezone <timezone>', permission: 4, cooldown: 3,
  handler: async (ctx: CommandContext) => {
    if (!ctx.text) { await ctx.reply(`Current: ${config.timezone}\nUsage: .settimezone <timezone>`); return; }
    db.setSetting('timezone', ctx.text); config.timezone = ctx.text;
    await ctx.reply(`✅ Timezone set to: ${ctx.text}`);
  },
};
