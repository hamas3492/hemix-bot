import { CommandContext } from '../types';
import sportsService from '../../services/SportsService';

export default {
  name: 'clstandings',
  alias: ['cl-standings'],
  category: 'sports',
  description: 'Get Champions League standings',
  usage: 'clstandings',
  permission: 0,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const data = await sportsService.getLeagueData('CL', 'standings');
    await ctx.reply(data);
  },
};
