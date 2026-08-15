import { CommandContext } from '../types';
export default {
  name: 'hidetag', alias: ['ht'], category: 'Group', description: 'Hidden tag all members', usage: '.hidetag <message>', permission: 2, cooldown: 10,
  handler: async (ctx: CommandContext) => {
    if (!ctx.isGroup || !ctx.groupMetadata) { await ctx.reply('❌ Group only!'); return; }
    const participants = ctx.groupMetadata.participants || [];
    const mentions = participants.map((p: any) => p.id || p.jid);
    const msg = ctx.text || '📢 Hidden tag';
    await ctx.client.sendMessage(ctx.jid, { text: msg, mentions });
  },
};
