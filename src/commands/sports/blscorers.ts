import { CommandContext } from '../types';
import sportsService from '../../services/SportsService';

export default {
  name: 'blscorers',
  alias: ['bl-scorers'],
  category: 'sports',
  description: 'Get Bundesliga top scorers',
  usage: 'blscorers',
  permission: 0,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const data = await sportsService.getLeagueData('BL', 'scorers');
    await ctx.reply(data);
  },
};
