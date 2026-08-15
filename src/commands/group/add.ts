import { Command } from '../../types/command';
import { formatNumberToJid, isBotAdmin } from '../../utils/groupHelpers';

const command: Command = {
  name: 'add',
  alias: ['inviteuser'],
  category: 'group',
  description: 'Add a user to the group by phone number',
  usage: '.add <number>',
  permission: 2,
  cooldown: 5,
  handler: async (ctx) => {
    if (!ctx.isGroup) {
      return ctx.reply('❌ This command can only be used in group chats.');
    }

    if (!isBotAdmin(ctx)) {
      return ctx.reply('❌ I need to be an admin to add users to this group.');
    }

    if (!ctx.args || ctx.args.length === 0) {
      return ctx.reply('❌ Please provide a phone number with country code.\nExample: .add 923001234567');
    }

    const rawNum = ctx.args[0].replace(/[^0-9]/g, '');
    if (!rawNum || rawNum.length < 7) {
      return ctx.reply('❌ Please enter a valid phone number with country code.');
    }

    const targetJid = formatNumberToJid(rawNum);

    try {
      const response = await ctx.client.groupParticipantsUpdate(ctx.jid, [targetJid], 'add');
      const result = response?.[0]?.status;

      if (result === '200') {
        return ctx.reply(`✅ Successfully added *@${rawNum}* to the group.`, { mentions: [targetJid] });
      } else if (result === '403' || result === '408') {
        return ctx.reply(`⚠️ Cannot add *@${rawNum}* directly due to their privacy settings or an invite is required.`, { mentions: [targetJid] });
      } else if (result === '409') {
        return ctx.reply(`⚠️ User *@${rawNum}* is already in this group.`, { mentions: [targetJid] });
      } else {
        return ctx.reply(`✅ Request sent to add *@${rawNum}*.`, { mentions: [targetJid] });
      }
    } catch (err: any) {
      return ctx.reply(`❌ Failed to add user: ${err.message || 'Unknown error'}`);
    }
  },
};

export default command;
