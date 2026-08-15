import { CommandContext } from '../types';
import { db } from '../../database';
export default {
  name: 'listbadword', alias: ['badwords'], category: 'Settings', description: 'List bad words', usage: '.listbadword', permission: 2, cooldown: 5,
  handler: async (ctx: CommandContext) => {
    const words = db.getGroupSetting(ctx.jid, 'badwords', '');
    if (!words) { await ctx.reply('📋 No bad words set!'); return; }
    await ctx.reply(`🚫 *Bad Words:*\n\n${words.split(',').join(', ')}`);
  },
};
