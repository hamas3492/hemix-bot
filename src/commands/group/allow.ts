import { Command } from '../../types/command';
import { getTargetJid } from '../../utils/groupHelpers';

const command: Command = {
  name: 'allow',
  alias: ['allowuser', 'whitelistuser'],
  category: 'group',
  description: 'Allow / whitelist a user in the group (exempt from filters)',
  usage: '.allow <@mention / number / reply>',
  permission: 2,
  cooldown: 3,
  handler: async (ctx) => {
    if (!ctx.isGroup) {
      return ctx.reply('❌ This command can only be used in group chats.');
    }

    const targetJid = getTargetJid(ctx);
    if (!targetJid) {
      return ctx.reply('❌ Please mention a user, reply to their message, or enter their number.');
    }

    const rawSetting = ctx.db.getGroupSetting(ctx.jid, 'allowed_users', '[]');
    let allowedList: string[] = [];
    try {
      allowedList = JSON.parse(rawSetting);
    } catch {
      allowedList = [];
    }

    if (allowedList.includes(targetJid)) {
      return ctx.reply('⚠️ User is already in the group allowed list.');
    }

    allowedList.push(targetJid);
    ctx.db.setGroupSetting(ctx.jid, 'allowed_users', JSON.stringify(allowedList));

    const num = targetJid.split('@')[0];
    return ctx.reply(`✅ User *@${num}* is now allowed/whitelisted in this group.`, { mentions: [targetJid] });
  },
};

export default command;
