import { CommandContext } from '../types'; import { db } from '../../database';
export default {
  name: 'setstatusemoji', alias: ['statemoji'], category: 'Owner', description: 'Set status emoji', usage: '.setstatusemoji <emoji>', permission: 4, cooldown: 3,
  handler: async (ctx: CommandContext) => {
    if (!ctx.text) { await ctx.reply('Usage: .setstatusemoji <emoji>'); return; }
    db.setSetting('status_emoji', ctx.text); await ctx.reply(`✅ Status emoji set to: ${ctx.text}`);
  },
};
