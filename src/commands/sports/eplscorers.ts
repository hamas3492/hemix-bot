import { CommandContext } from '../types';
import sportsService from '../../services/SportsService';

export default {
  name: 'eplscorers',
  alias: ['epl-scorers'],
  category: 'sports',
  description: 'Get Premier League top scorers',
  usage: 'eplscorers',
  permission: 0,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const data = await sportsService.getLeagueData('EPL', 'scorers');
    await ctx.reply(data);
  },
};
