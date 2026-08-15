import { CommandContext } from '../types';
import sportsService from '../../services/SportsService';

export default {
  name: 'eflmatches',
  alias: ['efl-matches'],
  category: 'sports',
  description: 'Get EFL matches',
  usage: 'eflmatches',
  permission: 0,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const data = await sportsService.getLeagueData('EFL', 'matches');
    await ctx.reply(data);
  },
};
