import { CommandContext } from '../types';
import sportsService from '../../services/SportsService';

export default {
  name: 'eflupcoming',
  alias: ['efl-upcoming'],
  category: 'sports',
  description: 'Get EFL upcoming matches',
  usage: 'eflupcoming',
  permission: 0,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const data = await sportsService.getLeagueData('EFL', 'upcoming');
    await ctx.reply(data);
  },
};
