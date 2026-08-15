import { CommandContext } from '../types';

export default {
  name: 'react',
  alias: ['reaction'],
  category: 'tools',
  description: 'React to a message with an emoji',
  usage: 'react <emoji>',
  permission: 0,
  cooldown: 2,
  handler: async (ctx: CommandContext) => {
    const emoji = ctx.args[0] || '👍';
    const targetKey = ctx.quoted ? ctx.quoted.key : ctx.message.key;

    try {
      await ctx.client.sendMessage(ctx.jid, { react: { text: emoji, key: targetKey } });
    } catch (err) {
      await ctx.reply(`❌ Reaction failed: ${(err as Error).message}`);
    }
  },
};
