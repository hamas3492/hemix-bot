import { CommandContext } from '../types';
import sportsService from '../../services/SportsService';

export default {
  name: 'upcoming',
  alias: ['upcomingmatches', 'nextmatches'],
  category: 'sports',
  description: 'Get upcoming matches from major leagues',
  usage: 'upcoming',
  permission: 0,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const epl = await sportsService.getLeagueData('EPL', 'upcoming');
    const cl = await sportsService.getLeagueData('CL', 'upcoming');
    await ctx.reply(`${epl}

====================

${cl}`);
  },
};
