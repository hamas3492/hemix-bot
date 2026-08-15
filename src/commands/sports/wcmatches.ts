import { CommandContext } from '../types';
import sportsService from '../../services/SportsService';

export default {
  name: 'wcmatches',
  alias: ['wc-matches'],
  category: 'sports',
  description: 'Get World Cup matches',
  usage: 'wcmatches',
  permission: 0,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const data = await sportsService.getLeagueData('WC', 'matches');
    await ctx.reply(data);
  },
};
