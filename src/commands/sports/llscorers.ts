import { CommandContext } from '../types';
import sportsService from '../../services/SportsService';

export default {
  name: 'llscorers',
  alias: ['ll-scorers'],
  category: 'sports',
  description: 'Get La Liga top scorers',
  usage: 'llscorers',
  permission: 0,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const data = await sportsService.getLeagueData('LL', 'scorers');
    await ctx.reply(data);
  },
};
