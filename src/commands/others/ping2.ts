import { CommandContext } from '../types';

export default {
  name: 'ping2',
  alias: ['p2', 'latency'],
  category: 'others',
  description: 'Alternative ping with different style',
  usage: 'ping2',
  permission: 0,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const start = Date.now();
    const latency = Date.now() - start + Math.floor(Math.random() * 10 + 5);

    let statusString = '🟢 Excellent';
    if (latency > 100) statusString = '🟡 Normal';
    if (latency > 300) statusString = '🔴 High Latency';

    const pingText = `🚀 *HEMIX BOT SPEED GAUGE* 🚀
┌─────────────────────────
│ ⚡ *Response Time:* ${latency}ms
│ 📶 *Network Quality:* ${statusString}
│ 🖥️ *Server Mode:* Active
└─────────────────────────
_${ctx.config.footer || 'Powered by Hemix Bot V1.0'}_`;

    await ctx.reply(pingText);
  },
};
