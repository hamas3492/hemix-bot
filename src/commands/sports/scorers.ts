import { CommandContext } from '../types';
import sportsService from '../../services/SportsService';

export default {
  name: 'scorers',
  alias: ['topscorers', 'allscorers'],
  category: 'sports',
  description: 'Get top scorers from major leagues',
  usage: 'scorers',
  permission: 0,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const epl = await sportsService.getLeagueData('EPL', 'scorers');
    const ll = await sportsService.getLeagueData('LL', 'scorers');
    const bl = await sportsService.getLeagueData('BL', 'scorers');
    await ctx.reply(`${epl}

====================

${ll}

====================

${bl}`);
  },
};
