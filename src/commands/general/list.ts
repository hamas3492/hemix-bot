import { CommandContext } from '../types';

export default {
  name: 'list',
  alias: ['listcmds', 'commands'],
  category: 'general',
  description: 'List commands by category (args: category name)',
  usage: 'list <category>',
  permission: 0,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const prefix = ctx.config.botPrefix || '.';
    const targetCategory = (ctx.args[0] || '').toLowerCase().trim();

    const commandsDatabase: Record<string, { name: string; desc: string; usage: string }[]> = {
      general: [
        { name: 'botinfo', desc: 'Show bot info (name, version, platform, uptime, prefix, mode)', usage: 'botinfo' },
        { name: 'categories', desc: 'List all command categories', usage: 'categories' },
        { name: 'generalmenu', desc: 'Show general commands menu', usage: 'generalmenu' },
        { name: 'list', desc: 'List commands by category (args: category name)', usage: 'list <category>' },
        { name: 'menu', desc: 'Dynamic menu showing all categories with command counts', usage: 'menu' },
      ],
      others: [
        { name: 'alive', desc: 'Check if bot is alive, show uptime and status', usage: 'alive' },
        { name: 'botstatus', desc: 'Detailed bot status (connection, uptime, RAM, CPU)', usage: 'botstatus' },
        { name: 'owner', desc: 'Show owner info (name, number from config)', usage: 'owner' },
        { name: 'pair', desc: 'Generate pairing info link', usage: 'pair' },
        { name: 'ping', desc: 'Response time check (show ms)', usage: 'ping' },
        { name: 'ping2', desc: 'Alternative ping with different style', usage: 'ping2' },
        { name: 'repo', desc: 'Show repository info (placeholder URL)', usage: 'repo' },
        { name: 'time', desc: 'Show current time in configured timezone', usage: 'time' },
        { name: 'uptime', desc: 'Show bot uptime formatted', usage: 'uptime' },
      ],
      owner: [
        { name: 'announcements', desc: 'View/send announcements', usage: 'announcements [msg]' },
        { name: 'block', desc: 'Block a user (args: number/jid)', usage: 'block <user>' },
        { name: 'broadcast', desc: 'Broadcast message to all chats', usage: 'broadcast <msg>' },
        { name: 'delvar', desc: 'Delete a variable (args: key)', usage: 'delvar <key>' },
        { name: 'getpp', desc: 'Get profile picture of a user', usage: 'getpp [@user]' },
        { name: 'getvar', desc: 'Get a variable value (args: key)', usage: 'getvar <key>' },
        { name: 'join', desc: 'Join a group via invite link (args: link)', usage: 'join <link>' },
        { name: 'leave', desc: 'Leave current group', usage: 'leave' },
        { name: 'listblocked', desc: 'List all blocked users', usage: 'listblocked' },
        { name: 'listsudo', desc: 'List all sudo users', usage: 'listsudo' },
        { name: 'logout', desc: 'Logout WhatsApp session', usage: 'logout' },
        { name: 'restart', desc: 'Restart the bot process', usage: 'restart' },
        { name: 'setbio', desc: 'Set bot bio/about (args: text)', usage: 'setbio <text>' },
        { name: 'setbotname', desc: 'Set bot display name (args: name)', usage: 'setbotname <name>' },
        { name: 'setgroupname', desc: 'Set group name (args: name)', usage: 'setgroupname <name>' },
        { name: 'setownername', desc: 'Set owner name in config (args: name)', usage: 'setownername <name>' },
        { name: 'setownernumber', desc: 'Set owner number in config (args: number)', usage: 'setownernumber <number>' },
        { name: 'setprefix', desc: 'Set command prefix (args: prefix)', usage: 'setprefix <prefix>' },
        { name: 'setprofilepic', desc: 'Set bot profile picture (reply to image)', usage: 'setprofilepic' },
        { name: 'setstatusemoji', desc: 'Set status emoji (args: emoji)', usage: 'setstatusemoji <emoji>' },
        { name: 'setstickerauthor', desc: 'Set sticker author name (args: name)', usage: 'setstickerauthor <name>' },
        { name: 'setstickerpackname', desc: 'Set sticker pack name (args: name)', usage: 'setstickerpackname <name>' },
        { name: 'settimezone', desc: 'Set timezone (args: timezone)', usage: 'settimezone <timezone>' },
        { name: 'setvar', desc: 'Set a variable (args: key value)', usage: 'setvar <key> <val>' },
        { name: 'unblock', desc: 'Unblock a user (args: number/jid)', usage: 'unblock <user>' },
        { name: 'unblockall', desc: 'Unblock all users', usage: 'unblockall' },
        { name: 'update', desc: 'Check for updates / show update info', usage: 'update' },
      ],
    };

    if (!targetCategory || !commandsDatabase[targetCategory]) {
      const available = Object.keys(commandsDatabase).map(c => `• *${c}*`).join('\n');
      await ctx.reply(
        `❌ Please specify a valid category!\n\n*Available categories:*\n${available}\n\n*Usage:* \`${prefix}list <category>\` (e.g. \`${prefix}list general\`)`
      );
      return;
    }

    const cmds = commandsDatabase[targetCategory];
    let listText = `╭─── [ 📁 *${targetCategory.toUpperCase()} COMMANDS* ] ───\n│\n`;

    cmds.forEach(c => {
      listText += `├ 🔹 *${prefix}${c.name}*\n│   └ _${c.desc}_\n`;
    });

    listText += `│\n╰─────────────────────────────────\n_${ctx.config.footer || 'Powered by Hemix Bot V1.0'}_`;

    await ctx.reply(listText);
  },
};
