import { CommandContext } from '../types';
import axios from 'axios';
import { aiService } from '../../services/AIService';

export default {
  name: 'browse',
  alias: ['fetchurl', 'webbrowse'],
  category: 'tools',
  description: 'Browse URL and summarize website content',
  usage: 'browse <URL>',
  permission: 0,
  cooldown: 5,
  handler: async (ctx: CommandContext) => {
    const url = ctx.args[0] || ctx.text;
    if (!url || !url.startsWith('http')) {
      return await ctx.reply('⚠️ Please provide a valid URL starting with http:// or https://');
    }

    await ctx.reply(`🌐 *Browsing ${url}...*`);

    try {
      const response = await axios.get(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        timeout: 10000,
      });

      const html = response.data;
      const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
      const title = titleMatch ? titleMatch[1].trim() : 'Website';

      const cleanText = html
        .replace(/<script\b[^<]*>([\s\S]*?)<\/script>/gi, '')
        .replace(/<style\b[^<]*>([\s\S]*?)<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 3000);

      const summary = await aiService.respond(ctx.jid, `Summarize this webpage content titled "${title}":\n\n${cleanText}`);
      await ctx.reply(`🌐 *WEBSITE SUMMARY: ${title}*\n🔗 *URL:* ${url}\n\n${summary}`);
    } catch (err) {
      await ctx.reply(`❌ Failed to browse URL: ${(err as Error).message}`);
    }
  },
};
