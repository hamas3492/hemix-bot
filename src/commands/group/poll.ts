import { CommandContext } from '../types';
export default {
  name: 'poll', alias: ['vote'], category: 'Group', description: 'Create a poll', usage: '.poll <question|opt1|opt2|...>', permission: 2, cooldown: 5,
  handler: async (ctx: CommandContext) => {
    if (!ctx.text?.includes('|')) { await ctx.reply('Usage: .poll <question|opt1|opt2|...>'); return; }
    const parts = ctx.text.split('|'); const name = parts[0]; const values = parts.slice(1).map(p => p.trim());
    if (values.length < 2) { await ctx.reply('❌ Need at least 2 options!'); return; }
    await ctx.client.sendMessage(ctx.jid, { poll: { name, values, selectableCount: 1 } });
  },
};
