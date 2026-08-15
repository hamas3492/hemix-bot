import { CommandContext } from '../types';
import sportsService from '../../services/SportsService';

export default {
  name: 'blmatches',
  alias: ['bl-matches'],
  category: 'sports',
  description: 'Get Bundesliga matches',
  usage: 'blmatches',
  permission: 0,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const data = await sportsService.getLeagueData('BL', 'matches');
    await ctx.reply(data);
  },
};
