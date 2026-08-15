import { CommandContext } from '../types';
import { db } from '../../database';

export default {
  name: 'feedback',
  alias: ['report', 'bug'],
  category: 'Support',
  description: 'Send feedback to owner',
  usage: '.feedback <message>',
  permission: 1,
  cooldown: 30,
  handler: async (ctx: CommandContext) => {
    if (!ctx.text) { await ctx.reply('📝 Please provide your feedback message!'); return; }
    try {
      db.addFeedback(ctx.sender, ctx.text);
      await ctx.reply('✅ Thank you! Your feedback has been recorded.');
    } catch (err: any) { await ctx.reply(`❌ Error: ${err.message}`); }
  },
};
