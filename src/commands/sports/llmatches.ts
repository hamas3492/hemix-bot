import { CommandContext } from '../types';
import sportsService from '../../services/SportsService';

export default {
  name: 'llmatches',
  alias: ['ll-matches'],
  category: 'sports',
  description: 'Get La Liga matches',
  usage: 'llmatches',
  permission: 0,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const data = await sportsService.getLeagueData('LL', 'matches');
    await ctx.reply(data);
  },
};
