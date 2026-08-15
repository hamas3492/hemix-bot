import { CommandContext } from '../types';
import { db } from '../../database'; import { config } from '../../config';
export default {
  name: 'mode', alias: [], category: 'Settings', description: 'Set bot mode', usage: '.mode <private/public>', permission: 4, cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const mode = ctx.args[0]?.toLowerCase(); if (!mode || !['private','public'].includes(mode)) {
      await ctx.reply(`📋 Current mode: ${config.botMode}\nUsage: .mode <private/public>`); return; }
    db.setSetting('mode', mode); config.botMode = mode as any; await ctx.reply(`✅ Mode set to ${mode}!`);
  },
};
