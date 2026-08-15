import { CommandContext } from '../types';
import sportsService from '../../services/SportsService';

export default {
  name: 'l1matches',
  alias: ['l1-matches'],
  category: 'sports',
  description: 'Get Ligue 1 matches',
  usage: 'l1matches',
  permission: 0,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const data = await sportsService.getLeagueData('L1', 'matches');
    await ctx.reply(data);
  },
};
