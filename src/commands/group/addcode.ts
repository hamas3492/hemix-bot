import { Command } from '../../types/command';

const command: Command = {
  name: 'addcode',
  alias: ['allowcode'],
  category: 'group',
  description: 'Add a country code to the allowed list',
  usage: '.addcode <code>',
  permission: 2,
  cooldown: 3,
  handler: async (ctx) => {
    if (!ctx.isGroup) {
      return ctx.reply('❌ This command can only be used in group chats.');
    }

    if (!ctx.args || ctx.args.length === 0) {
      return ctx.reply('❌ Please specify a country code.\nExample: .addcode 92');
    }

    const code = ctx.args[0].replace(/[^0-9]/g, '');
    if (!code) {
      return ctx.reply('❌ Please enter a valid numerical country code (e.g. 92, 1, 44).');
    }

    const rawSetting = ctx.db.getGroupSetting(ctx.jid, 'allowed_codes', '[]');
    let codes: string[] = [];
    try {
      codes = JSON.parse(rawSetting);
    } catch {
      codes = [];
    }

    if (codes.includes(code)) {
      return ctx.reply(`⚠️ Country code *+${code}* is already in the allowed list.`);
    }

    codes.push(code);
    ctx.db.setGroupSetting(ctx.jid, 'allowed_codes', JSON.stringify(codes));

    return ctx.reply(`✅ Country code *+${code}* added to the allowed list.\n\nAllowed codes: ${codes.map(c => '+' + c).join(', ')}`);
  },
};

export default command;
