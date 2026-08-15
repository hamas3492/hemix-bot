import { CommandContext } from '../types';
import sportsService from '../../services/SportsService';

export default {
  name: 'l1standings',
  alias: ['l1-standings'],
  category: 'sports',
  description: 'Get Ligue 1 standings',
  usage: 'l1standings',
  permission: 0,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const data = await sportsService.getLeagueData('L1', 'standings');
    await ctx.reply(data);
  },
};
