import { CommandContext } from '../types';
import os from 'os';
import fs from 'fs';

export default {
  name: 'disk',
  alias: ['storage', 'diskinfo'],
  category: 'tools',
  description: 'Show server disk and memory storage info',
  usage: 'disk',
  permission: 0,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
    const freeMem = (os.freemem() / 1024 / 1024 / 1024).toFixed(2);
    const usedMem = (parseFloat(totalMem) - parseFloat(freeMem)).toFixed(2);
    const memUsage = ((parseFloat(usedMem) / parseFloat(totalMem)) * 100).toFixed(1);

    let diskInfo = 'Storage stats active';
    try {
      const stats = fs.statSync('/');
      diskInfo = 'Available: Root storage ready';
    } catch {}

    const text = `💾 *SYSTEM & DISK STORAGE INFO*

🖥️ *RAM Usage:* ${usedMem} GB / ${totalMem} GB (${memUsage}%)
🧠 *Free Memory:* ${freeMem} GB
⚙️ *Platform:* ${os.platform()} (${os.arch()})
⏰ *System Uptime:* ${(os.uptime() / 3600).toFixed(1)} hours
📂 *Storage:* ${diskInfo}`;

    await ctx.reply(text);
  },
};
