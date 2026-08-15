import { CommandContext } from '../types';
import { aiService } from '../../services/AIService';

export default {
  name: 'programming',
  alias: ['code', 'coding'],
  category: 'AI',
  description: 'AI-assisted programming help',
  usage: '.programming <question>',
  permission: 1,
  cooldown: 10,
  handler: async (ctx: CommandContext) => {
    if (!ctx.text) { await ctx.reply('💻 Please provide a programming question!'); return; }
    await ctx.reply('💻 Processing your programming query...');
    try {
      const response = await aiService.respond(ctx.jid, `As a programming assistant, help with this: ${ctx.text}`);
      await ctx.reply(response);
    } catch (err: any) { await ctx.reply(`❌ Error: ${err.message}`); }
  },
};
