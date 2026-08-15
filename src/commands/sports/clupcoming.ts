import { CommandContext } from '../types';
import sportsService from '../../services/SportsService';

export default {
  name: 'clupcoming',
  alias: ['cl-upcoming'],
  category: 'sports',
  description: 'Get Champions League upcoming matches',
  usage: 'clupcoming',
  permission: 0,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const data = await sportsService.getLeagueData('CL', 'upcoming');
    await ctx.reply(data);
  },
};
