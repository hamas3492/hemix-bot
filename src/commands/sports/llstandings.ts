import { CommandContext } from '../types';
import sportsService from '../../services/SportsService';

export default {
  name: 'llstandings',
  alias: ['ll-standings'],
  category: 'sports',
  description: 'Get La Liga standings',
  usage: 'llstandings',
  permission: 0,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const data = await sportsService.getLeagueData('LL', 'standings');
    await ctx.reply(data);
  },
};
