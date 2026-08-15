import { CommandContext } from '../types';
import axios from 'axios';

export default {
  name: 'deepseek',
  alias: ['ds', 'deepseekai'],
  category: 'ai',
  description: 'Query DeepSeek AI model',
  usage: '.deepseek <prompt>',
  permission: 1,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const prompt = ctx.args.join(' ').trim() || ctx.text?.trim();

    if (!prompt) {
      await ctx.reply('⚠️ Please provide a prompt for DeepSeek!\n\n*Example:* `.deepseek Write a story about space.`');
      return;
    }

    const dsConfig = ctx.db.getApiConfig('deepseek');
    const apiKey = process.env.DEEPSEEK_API_KEY || dsConfig?.key_encrypted;
    const baseUrl = dsConfig?.base_url || 'https://api.deepseek.com/v1';

    if (!apiKey) {
      await ctx.reply(
        '⚠️ *DeepSeek provider is not available or configured.*\n\n' +
          'To use DeepSeek, set `DEEPSEEK_API_KEY` in environment variables or database config.'
      );
      return;
    }

    await ctx.reply('🐋 *DeepSeek is thinking...*');

    try {
      const response = await axios.post(
        `${baseUrl.replace(/\/+$/, '')}/chat/completions`,
        {
          model: dsConfig?.model || 'deepseek-chat',
          messages: [
            { role: 'system', content: 'You are DeepSeek, a helpful AI assistant.' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      const replyText = response.data?.choices?.[0]?.message?.content;

      if (!replyText) {
        await ctx.reply('❌ Empty response received from DeepSeek API.');
        return;
      }

      await ctx.reply(`🐋 *DeepSeek:* \n\n${replyText.trim()}`);
    } catch (err: any) {
      await ctx.reply(`❌ DeepSeek API Error: ${err.response?.data?.error?.message || err.message || err}`);
    }
  },
};
