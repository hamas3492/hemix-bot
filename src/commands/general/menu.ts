import { CommandContext } from '../types';
import { formatUptime, detectPlatform } from '../../utils/helpers';

export default {
  name: 'menu',
  alias: ['help', 'allmenu', 'mainmenu', 'h'],
  category: 'general',
  description: 'Dynamic menu showing all categories with command counts, premium styled output',
  usage: 'menu',
  permission: 0,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const prefix = ctx.config.botPrefix || '.';
    const botName = ctx.config.botName || 'Hemix Bot';
    const userName = ctx.senderName || 'User';
    const uptimeStr = formatUptime(process.uptime());
    const platform = detectPlatform();

    const generalCmds = ['botinfo', 'categories', 'generalmenu', 'list', 'menu'];
    const othersCmds = ['alive', 'botstatus', 'owner', 'pair', 'ping', 'ping2', 'repo', 'time', 'uptime'];
    const ownerCmds = [
      'announcements', 'block', 'broadcast', 'delvar', 'getpp', 'getvar', 'join',
      'leave', 'listblocked', 'listsudo', 'logout', 'restart', 'setbio', 'setbotname',
      'setgroupname', 'setownername', 'setownernumber', 'setprefix', 'setprofilepic',
      'setstatusemoji', 'setstickerauthor', 'setstickerpackname', 'settimezone',
      'setvar', 'unblock', 'unblockall', 'update'
    ];

    const totalCount = generalCmds.length + othersCmds.length + ownerCmds.length;

    const formattedDate = new Date().toLocaleString('en-US', { timeZone: ctx.config.timezone || 'Asia/Karachi' });

    let menuText = `╭━━━❮ 👑 *${botName.toUpperCase()}* 👑 ❯━━━
┃
┃ 👤 *User:* ${userName}
┃ ⚡ *Prefix:* [ ${prefix} ]
┃ ⏱️ *Uptime:* ${uptimeStr}
┃ 💻 *Platform:* ${platform}
┃ 📅 *Date:* ${formattedDate}
┃ 📊 *Total Commands:* ${totalCount}
┃
┣━━━━━━━━━━━━━━━━━━━━━
┃
┃ 🌐 *[ GENERAL ]* (${generalCmds.length} commands)
${generalCmds.map(cmd => `┃  ▸ \`${prefix}${cmd}\``).join('\n')}
┃
┃ 🛠️ *[ OTHERS ]* (${othersCmds.length} commands)
${othersCmds.map(cmd => `┃  ▸ \`${prefix}${cmd}\``).join('\n')}
┃
┃ 👑 *[ OWNER ]* (${ownerCmds.length} commands)
${ownerCmds.map(cmd => `┃  ▸ \`${prefix}${cmd}\``).join('\n')}
┃
╰━━━━━━━━━━━━━━━━━━━━━
_${ctx.config.footer || 'Powered by Hemix Bot V1.0'}_`;

    await ctx.reply(menuText);
  },
};
