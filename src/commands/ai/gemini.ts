import { CommandContext } from '../types';
import axios from 'axios';

export default {
  name: 'gemini',
  alias: ['bard', 'googleai'],
  category: 'ai',
  description: 'Query Google Gemini AI model',
  usage: '.gemini <prompt>',
  permission: 1,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const prompt = ctx.args.join(' ').trim() || ctx.text?.trim();

    if (!prompt) {
      await ctx.reply('⚠️ Please provide a prompt for Gemini!\n\n*Example:* `.gemini Explain relativity simply.`');
      return;
    }

    const geminiConfig = ctx.db.getApiConfig('gemini');
    const apiKey = process.env.GEMINI_API_KEY || geminiConfig?.key_encrypted;

    if (!apiKey) {
      await ctx.reply(
        '⚠️ *Gemini provider is not available or configured.*\n\n' +
          'To use Gemini, set `GEMINI_API_KEY` in environment variables or database config.'
      );
      return;
    }

    await ctx.reply('✨ *Gemini is thinking...*');

    try {
      const model = geminiConfig?.model || 'gemini-1.5-flash';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const response = await axios.post(
        url,
        {
          contents: [{ parts: [{ text: prompt }] }],
        },
        { headers: { 'Content-Type': 'application/json' }, timeout: 30000 }
      );

      const replyText =
        response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!replyText) {
        await ctx.reply('❌ Received empty response from Gemini API.');
        return;
      }

      await ctx.reply(`✨ *Gemini:* \n\n${replyText.trim()}`);
    } catch (err: any) {
      await ctx.reply(`❌ Gemini API Error: ${err.response?.data?.error?.message || err.message || err}`);
    }
  },
};
