import { CommandContext } from '../types';
export default {
  name: 'fetchgroups', alias: ['groups'], category: 'Group', description: 'Fetch all groups bot is in', usage: '.fetchgroups', permission: 4, cooldown: 10,
  handler: async (ctx: CommandContext) => {
    try {
      const groups = ctx.client.groupFetchAllParticipating ? await ctx.client.groupFetchAllParticipating() : {};
      const ids = Object.keys(groups);
      if (ids.length === 0) { await ctx.reply('📋 No groups found!'); return; }
      let text = `📋 *Groups (${ids.length}):*\n\n`;
      for (const id of ids) text += `• ${groups[id].subject || id}\n  ${id}\n`;
      await ctx.reply(text);
    } catch (err: any) { await ctx.reply(`❌ Error: ${err.message}`); }
  },
};
