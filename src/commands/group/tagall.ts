import { CommandContext } from '../types';
export default {
  name: 'tagall', alias: ['mentionall'], category: 'Group', description: 'Tag all members', usage: '.tagall <optional message>', permission: 2, cooldown: 10,
  handler: async (ctx: CommandContext) => {
    if (!ctx.isGroup || !ctx.groupMetadata) { await ctx.reply('❌ Group only!'); return; }
    const participants = ctx.groupMetadata.participants || [];
    const mentions: string[] = [];
    let tags = '';
    for (const p of participants) { const jid = p.id || p.jid; mentions.push(jid); tags += `@${jid.split('@')[0]} `; }
    const msg = ctx.text ? ctx.text + '\n\n' + tags : `📢 *Tag All*\n\n${tags}`;
    await ctx.client.sendMessage(ctx.jid, { text: msg, mentions });
  },
};
