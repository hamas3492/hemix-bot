import { CommandContext } from '../types';
import { aiService } from '../../services/AIService';

export default {
  name: 'ai',
  alias: ['ask', 'gpt4'],
  category: 'AI',
  description: 'Generic AI command',
  usage: '.ai <prompt>',
  permission: 1,
  cooldown: 10,
  handler: async (ctx: CommandContext) => {
    if (!ctx.text) { await ctx.reply('🤖 Please provide a prompt!'); return; }
    try {
      const response = await aiService.respond(ctx.jid, ctx.text);
      await ctx.reply(response);
    } catch (err: any) { await ctx.reply(`❌ Error: ${err.message}`); }
  },
};
