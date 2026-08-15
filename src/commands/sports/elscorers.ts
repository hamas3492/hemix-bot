import { CommandContext } from '../types';
import sportsService from '../../services/SportsService';

export default {
  name: 'elscorers',
  alias: ['el-scorers'],
  category: 'sports',
  description: 'Get Europa League top scorers',
  usage: 'elscorers',
  permission: 0,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const data = await sportsService.getLeagueData('EL', 'scorers');
    await ctx.reply(data);
  },
};
