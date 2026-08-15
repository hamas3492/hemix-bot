import { CommandContext } from '../types';
export default {
  name: 'tagadmin', alias: ['admins'], category: 'Group', description: 'Tag all admins', usage: '.tagadmin', permission: 2, cooldown: 5,
  handler: async (ctx: CommandContext) => {
    if (!ctx.isGroup || !ctx.groupMetadata) { await ctx.reply('❌ Group only!'); return; }
    const admins = ctx.groupMetadata.participants.filter((p: any) => p.admin);
    const mentions = admins.map((p: any) => p.id);
    let text = '👮 *Admins:*\n\n';
    for (const a of admins) text += `@${(a.id || a.jid).split('@')[0]}\n`;
    await ctx.client.sendMessage(ctx.jid, { text, mentions });
  },
};
