import { CommandContext } from '../types';
import sportsService from '../../services/SportsService';

export default {
  name: 'llupcoming',
  alias: ['ll-upcoming'],
  category: 'sports',
  description: 'Get La Liga upcoming matches',
  usage: 'llupcoming',
  permission: 0,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const data = await sportsService.getLeagueData('LL', 'upcoming');
    await ctx.reply(data);
  },
};
