import { CommandContext } from '../types';

export default {
  name: 'delvar',
  alias: ['unsetvar', 'deletevar'],
  category: 'owner',
  description: 'Delete a variable (args: key)',
  usage: 'delvar <key>',
  permission: 4,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const key = ctx.args[0];

    if (!key) {
      await ctx.reply(`❌ Please provide a variable key to delete.\n\n*Usage:* \`${ctx.config.botPrefix}delvar <key>\``);
      return;
    }

    const existing = ctx.db.getVariable(key);
    if (existing === null) {
      await ctx.reply(`❌ Variable \`${key}\` does not exist in the database.`);
      return;
    }

    ctx.db.deleteVariable(key);
    await ctx.reply(`✅ Variable \`${key}\` has been deleted successfully.`);
  },
};
