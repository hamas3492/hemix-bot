import { Command } from '../../types/command';

const command: Command = {
  name: 'addbadword',
  alias: ['addbad', 'addfilterword'],
  category: 'group',
  description: 'Add a bad word to the group filter list',
  usage: '.addbadword <word>',
  permission: 2,
  cooldown: 3,
  handler: async (ctx) => {
    if (!ctx.isGroup) {
      return ctx.reply('❌ This command can only be used in group chats.');
    }

    if (!ctx.text || ctx.text.trim().length === 0) {
      return ctx.reply('❌ Please specify a word to add to the bad word filter.\nExample: .addbadword badword');
    }

    const wordToAdd = ctx.text.trim().toLowerCase();
    const rawSetting = ctx.db.getGroupSetting(ctx.jid, 'badwords', '[]');

    let badwords: string[] = [];
    try {
      badwords = JSON.parse(rawSetting);
    } catch {
      badwords = [];
    }

    if (badwords.includes(wordToAdd)) {
      return ctx.reply(`⚠️ Word "*${wordToAdd}*" is already in the bad word list.`);
    }

    badwords.push(wordToAdd);
    ctx.db.setGroupSetting(ctx.jid, 'badwords', JSON.stringify(badwords));

    return ctx.reply(`✅ Added "*${wordToAdd}*" to the group bad word list.\n\nTotal bad words: *${badwords.length}*`);
  },
};

export default command;
