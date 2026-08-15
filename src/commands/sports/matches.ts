import { CommandContext } from '../types';
import sportsService from '../../services/SportsService';

export default {
  name: 'matches',
  alias: ['todaymatches', 'allmatches'],
  category: 'sports',
  description: 'Get today matches from all major leagues',
  usage: 'matches',
  permission: 0,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const epl = await sportsService.getLeagueData('EPL', 'matches');
    const ll = await sportsService.getLeagueData('LL', 'matches');
    const bl = await sportsService.getLeagueData('BL', 'matches');
    await ctx.reply(`${epl}

====================

${ll}

====================

${bl}`);
  },
};
