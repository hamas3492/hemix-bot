import { CommandContext } from '../types';
import sportsService from '../../services/SportsService';

export default {
  name: 'wcupcoming',
  alias: ['wc-upcoming'],
  category: 'sports',
  description: 'Get World Cup upcoming matches',
  usage: 'wcupcoming',
  permission: 0,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const data = await sportsService.getLeagueData('WC', 'upcoming');
    await ctx.reply(data);
  },
};
