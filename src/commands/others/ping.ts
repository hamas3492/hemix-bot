import { CommandContext } from '../types';

export default {
  name: 'ping',
  alias: ['p', 'speed'],
  category: 'others',
  description: 'Response time check (show ms)',
  usage: 'ping',
  permission: 0,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const startTime = Date.now();
    const tempMsg = await ctx.reply('🏓 *Pinging server...*');
    const latency = Date.now() - startTime;

    const responseText = `🏓 *Pong!*
⚡ *Speed:* \`${latency} ms\``;

    if (tempMsg && ctx.client && ctx.client.sendMessage) {
      try {
        await ctx.client.sendMessage(ctx.jid, { text: responseText, edit: tempMsg.key });
      } catch {
        await ctx.reply(responseText);
      }
    } else {
      await ctx.reply(responseText);
    }
  },
};
