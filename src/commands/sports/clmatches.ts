import { CommandContext } from '../types';
import sportsService from '../../services/SportsService';

export default {
  name: 'clmatches',
  alias: ['cl-matches'],
  category: 'sports',
  description: 'Get Champions League matches',
  usage: 'clmatches',
  permission: 0,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const data = await sportsService.getLeagueData('CL', 'matches');
    await ctx.reply(data);
  },
};
