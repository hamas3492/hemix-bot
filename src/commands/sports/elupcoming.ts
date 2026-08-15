import { CommandContext } from '../types';
import sportsService from '../../services/SportsService';

export default {
  name: 'elupcoming',
  alias: ['el-upcoming'],
  category: 'sports',
  description: 'Get Europa League upcoming matches',
  usage: 'elupcoming',
  permission: 0,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const data = await sportsService.getLeagueData('EL', 'upcoming');
    await ctx.reply(data);
  },
};
