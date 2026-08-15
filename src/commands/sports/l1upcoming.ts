import { CommandContext } from '../types';
import sportsService from '../../services/SportsService';

export default {
  name: 'l1upcoming',
  alias: ['l1-upcoming'],
  category: 'sports',
  description: 'Get Ligue 1 upcoming matches',
  usage: 'l1upcoming',
  permission: 0,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const data = await sportsService.getLeagueData('L1', 'upcoming');
    await ctx.reply(data);
  },
};
