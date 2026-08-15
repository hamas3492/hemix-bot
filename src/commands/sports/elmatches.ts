import { CommandContext } from '../types';
import sportsService from '../../services/SportsService';

export default {
  name: 'elmatches',
  alias: ['el-matches'],
  category: 'sports',
  description: 'Get Europa League matches',
  usage: 'elmatches',
  permission: 0,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const data = await sportsService.getLeagueData('EL', 'matches');
    await ctx.reply(data);
  },
};
