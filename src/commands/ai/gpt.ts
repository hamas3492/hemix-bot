import { CommandContext } from '../types';
import { AIService, aiService } from '../../services/AIService';

export default {
  name: 'gpt',
  alias: ['chatgpt3', 'gpt3', 'gpt4'],
  category: 'ai',
  description: 'Query OpenAI GPT AI model',
  usage: '.gpt <your question or prompt>',
  permission: 1,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const prompt = ctx.args.join(' ').trim() || ctx.text?.trim();

    if (!prompt) {
      await ctx.reply('⚠️ Please provide a prompt or question for GPT!\n\n*Example:* `.gpt What is quantum computing?`');
      return;
    }

    await ctx.reply('🤖 *Thinking...* Please wait.');

    try {
      const response = await aiService.respond(ctx.jid, prompt);
      await ctx.reply(response);
    } catch (err: any) {
      await ctx.reply(`❌ GPT Error: ${err.message || err}`);
    }
  },
};
