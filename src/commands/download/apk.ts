import { CommandContext } from '../types';
import axios from 'axios';

export default {
  name: 'apk',
  alias: ['apkpure'],
  category: 'Download',
  description: 'Search APK info',
  usage: '.apk <app name>',
  permission: 1,
  cooldown: 10,
  handler: async (ctx: CommandContext) => {
    if (!ctx.text) { await ctx.reply('📱 Please provide an app name!'); return; }
    try {
      await ctx.reply(`🔍 Searching for "${ctx.text}" on APKPure...`);
      await ctx.reply(`📱 Search APKPure manually: https://apkpure.com/search?q=${encodeURIComponent(ctx.text)}`);
    } catch (err: any) { await ctx.reply(`❌ Error: ${err.message}`); }
  },
};
