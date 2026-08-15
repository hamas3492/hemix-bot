import { CommandContext } from '../types';
import sportsService from '../../services/SportsService';

export default {
  name: 'eplmatches',
  alias: ['epl-matches'],
  category: 'sports',
  description: 'Get Premier League matches',
  usage: 'eplmatches',
  permission: 0,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const data = await sportsService.getLeagueData('EPL', 'matches');
    await ctx.reply(data);
  },
};
