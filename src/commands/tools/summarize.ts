import { CommandContext } from '../types';
import { aiService } from '../../services/AIService';

export default {
  name: 'summarize',
  alias: ['summary', 'tldr'],
  category: 'tools',
  description: 'AI-based text summarizer',
  usage: 'summarize <text or reply to text>',
  permission: 0,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const text = ctx.text || ctx.args.join(' ') || ctx.quoted?.message?.conversation || ctx.quoted?.message?.extendedTextMessage?.text;

    if (!text) {
      return await ctx.reply('⚠️ Please provide text to summarize or reply to a text message.');
    }

    try {
      const summary = await aiService.respond(ctx.jid, `Provide a concise bulleted summary and TL;DR for the following text:\n\n${text}`);
      await ctx.reply(`📑 *SUMMARY & KEY POINTS*\n\n${summary}`);
    } catch (err) {
      await ctx.reply(`❌ Summarization failed: ${(err as Error).message}`);
    }
  },
};
