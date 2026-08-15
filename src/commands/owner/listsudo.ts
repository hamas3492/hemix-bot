import { CommandContext } from '../types'; import { db } from '../../database';
export default {
  name: 'listsudo', alias: ['sudousers'], category: 'Owner', description: 'List sudo users', usage: '.listsudo', permission: 4, cooldown: 5,
  handler: async (ctx: CommandContext) => {
    const sudos = db.getSudos();
    if (sudos.length === 0) { await ctx.reply('📋 No sudo users!'); return; }
    let text = '👑 *Sudo Users:*\n\n';
    for (const jid of sudos) text += `• @${jid.split('@')[0]}\n`;
    await ctx.reply(text);
  },
};
