import os from 'os';
import { CommandContext } from '../types';
import { formatUptime, detectPlatform } from '../../utils/helpers';

export default {
  name: 'botstatus',
  alias: ['status', 'sysstatus', 'stats'],
  category: 'others',
  description: 'Detailed bot status (connection, uptime, RAM, CPU)',
  usage: 'botstatus',
  permission: 0,
  cooldown: 5,
  handler: async (ctx: CommandContext) => {
    const memoryUsage = process.memoryUsage();
    const heapUsedMb = (memoryUsage.heapUsed / 1024 / 1024).toFixed(2);
    const heapTotalMb = (memoryUsage.heapTotal / 1024 / 1024).toFixed(2);
    const rssMb = (memoryUsage.rss / 1024 / 1024).toFixed(2);

    const totalMemGb = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
    const freeMemGb = (os.freemem() / 1024 / 1024 / 1024).toFixed(2);
    const usedMemGb = ((os.totalmem() - os.freemem()) / 1024 / 1024 / 1024).toFixed(2);

    const cpus = os.cpus();
    const cpuModel = cpus.length > 0 ? cpus[0].model.trim() : 'Unknown';
    const cpuCores = cpus.length;

    const processUptime = formatUptime(process.uptime());
    const sysUptime = formatUptime(os.uptime());
    const platform = detectPlatform();

    const statusMsg = `╭─── [ 📊 *DETAILED SYSTEM STATUS* ] ───
│
├ 🌐 *Connection:* Connected 🟢
├ 🤖 *Bot Uptime:* ${processUptime}
├ 🖥️ *System Uptime:* ${sysUptime}
│
├ 💾 *Process Memory:*
│  ├ Heap: ${heapUsedMb} MB / ${heapTotalMb} MB
│  └ RSS: ${rssMb} MB
│
├ 💻 *System RAM:*
│  ├ Used: ${usedMemGb} GB / ${totalMemGb} GB
│  └ Free: ${freeMemGb} GB
│
├ ⚡ *CPU Info:*
│  ├ Model: ${cpuModel}
│  └ Cores: ${cpuCores}
│
├ 🐧 *Platform:* ${platform} (${os.platform()} ${os.arch()})
├ 🟢 *Node.js:* ${process.version}
├ 🗄️ *Database:* SQLite3 (WAL Mode)
│
╰──────────────────────────────────────
_${ctx.config.footer || 'Powered by Hemix Bot V1.0'}_`;

    await ctx.reply(statusMsg);
  },
};
