import { CommandContext } from '../types';
import sportsService from '../../services/SportsService';

export default {
  name: 'eflscorers',
  alias: ['efl-scorers'],
  category: 'sports',
  description: 'Get EFL top scorers',
  usage: 'eflscorers',
  permission: 0,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const data = await sportsService.getLeagueData('EFL', 'scorers');
    await ctx.reply(data);
  },
};
