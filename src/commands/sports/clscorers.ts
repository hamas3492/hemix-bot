import { CommandContext } from '../types';
import sportsService from '../../services/SportsService';

export default {
  name: 'clscorers',
  alias: ['cl-scorers'],
  category: 'sports',
  description: 'Get Champions League top scorers',
  usage: 'clscorers',
  permission: 0,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const data = await sportsService.getLeagueData('CL', 'scorers');
    await ctx.reply(data);
  },
};
