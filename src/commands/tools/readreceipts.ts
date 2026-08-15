import { CommandContext } from '../types';

export default {
  name: 'readreceipts',
  alias: ['readreceipt', 'blue-ticks'],
  category: 'tools',
  description: 'View or toggle read receipts status for bot',
  usage: 'readreceipts [on|off]',
  permission: 0,
  cooldown: 2,
  handler: async (ctx: CommandContext) => {
    const state = ctx.args[0]?.toLowerCase();
    if (state === 'on' || state === 'off') {
      ctx.db.setSetting('read_receipts', state);
      return await ctx.reply(`✅ Read receipts toggled: *${state.toUpperCase()}*`);
    }

    const current = ctx.db.getSetting('read_receipts', 'on');
    await ctx.reply(`👁️ *READ RECEIPTS STATUS*\n\nCurrent Setting: *${current.toUpperCase()}*\nUse \`readreceipts on\` or \`readreceipts off\` to switch mode.`);
  },
};
