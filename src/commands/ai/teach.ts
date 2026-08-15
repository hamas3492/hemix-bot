import { CommandContext } from '../types';
import { db } from '../../database';

export default {
  name: 'teach',
  alias: ['learn'],
  category: 'AI',
  description: 'Teach the AI something',
  usage: '.teach <text>',
  permission: 1,
  cooldown: 5,
  handler: async (ctx: CommandContext) => {
    if (!ctx.text) { await ctx.reply('🧠 What do you want to teach me?'); return; }
    const existing = db.getGroupSetting(ctx.jid, 'ai_context') || '';
    db.setGroupSetting(ctx.jid, 'ai_context', existing + '\n' + ctx.text);
    await ctx.reply('✅ Learned! I\'ll remember this for our conversations.');
  },
};
