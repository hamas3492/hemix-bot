import { CommandContext } from '../types';
import sportsService from '../../services/SportsService';

export default {
  name: 'wcscorers',
  alias: ['wc-scorers'],
  category: 'sports',
  description: 'Get World Cup top scorers',
  usage: 'wcscorers',
  permission: 0,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const data = await sportsService.getLeagueData('WC', 'scorers');
    await ctx.reply(data);
  },
};
