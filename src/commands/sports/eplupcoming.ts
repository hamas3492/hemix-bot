import { CommandContext } from '../types';
import sportsService from '../../services/SportsService';

export default {
  name: 'eplupcoming',
  alias: ['epl-upcoming'],
  category: 'sports',
  description: 'Get Premier League upcoming matches',
  usage: 'eplupcoming',
  permission: 0,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const data = await sportsService.getLeagueData('EPL', 'upcoming');
    await ctx.reply(data);
  },
};
