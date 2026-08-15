import { CommandContext } from '../types';
export default {
  name: 'tag', alias: [], category: 'Group', description: 'Tag specific user', usage: '.tag @user', permission: 1, cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const target = ctx.args[0]?.replace(/[@!]/g, '');
    if (!target) { await ctx.reply('Usage: .tag @user'); return; }
    const jid = target.includes('@') ? target : `${target}@s.whatsapp.net`;
    await ctx.client.sendMessage(ctx.jid, { text: `@${target}`, mentions: [jid] });
  },
};
