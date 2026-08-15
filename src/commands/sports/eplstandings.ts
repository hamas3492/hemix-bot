import { CommandContext } from '../types';
import sportsService from '../../services/SportsService';

export default {
  name: 'eplstandings',
  alias: ['epl-standings'],
  category: 'sports',
  description: 'Get Premier League standings',
  usage: 'eplstandings',
  permission: 0,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const data = await sportsService.getLeagueData('EPL', 'standings');
    await ctx.reply(data);
  },
};
