import { Command } from '../../types/command';
import { getTargetJid } from '../../utils/groupHelpers';

const command: Command = {
  name: 'addignorelist',
  alias: ['ignoreuser', 'ignore'],
  category: 'group',
  description: 'Add a user to the group ignore list',
  usage: '.addignorelist <@mention / number / reply>',
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

    const rawSetting = ctx.db.getGroupSetting(ctx.jid, 'ignore_list', '[]');
    let ignoreList: string[] = [];
    try {
      ignoreList = JSON.parse(rawSetting);
    } catch {
      ignoreList = [];
    }

    if (ignoreList.includes(targetJid)) {
      return ctx.reply('⚠️ User is already on the group ignore list.');
    }

    ignoreList.push(targetJid);
    ctx.db.setGroupSetting(ctx.jid, 'ignore_list', JSON.stringify(ignoreList));

    const num = targetJid.split('@')[0];
    return ctx.reply(`✅ Added *@${num}* to the group ignore list. Messages/commands from this user will be ignored.`, { mentions: [targetJid] });
  },
};

export default command;
