import { CommandContext } from '../types';
export default {
  name: 'delete', alias: ['del'], category: 'Group', description: 'Delete message', usage: '.delete (reply to message)', permission: 2, cooldown: 3,
  handler: async (ctx: CommandContext) => {
    if (!ctx.quoted) { await ctx.reply('Reply to a message to delete!'); return; }
    try {
      const key = ctx.quoted.key || { id: ctx.message.message?.extendedTextMessage?.contextInfo?.stanzaId, remoteJid: ctx.jid };
      await ctx.client.sendMessage(ctx.jid, { delete: key });
    } catch (err: any) { await ctx.reply(`❌ Error: ${err.message}`); }
  },
};
