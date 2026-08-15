import { Command } from '../../types/command';

const command: Command = {
  name: 'addcountrycode',
  alias: ['addcc'],
  category: 'group',
  description: 'Add a country code for the anti-foreign filter',
  usage: '.addcountrycode <code>',
  permission: 2,
  cooldown: 3,
  handler: async (ctx) => {
    if (!ctx.isGroup) {
      return ctx.reply('❌ This command can only be used in group chats.');
    }

    if (!ctx.args || ctx.args.length === 0) {
      return ctx.reply('❌ Please specify a country code.\nExample: .addcountrycode 92');
    }

    const code = ctx.args[0].replace(/[^0-9]/g, '');
    if (!code) {
      return ctx.reply('❌ Please enter a valid numerical country code.');
    }

    const rawSetting = ctx.db.getGroupSetting(ctx.jid, 'antiforeign_codes', '[]');
    let codes: string[] = [];
    try {
      codes = JSON.parse(rawSetting);
    } catch {
      codes = [];
    }

    if (codes.includes(code)) {
      return ctx.reply(`⚠️ Country code *+${code}* is already configured for anti-foreign filter.`);
    }

    codes.push(code);
    ctx.db.setGroupSetting(ctx.jid, 'antiforeign_codes', JSON.stringify(codes));

    return ctx.reply(`✅ Added country code *+${code}* to anti-foreign whitelist.\n\nConfigured codes: ${codes.map(c => '+' + c).join(', ')}`);
  },
};

export default command;
