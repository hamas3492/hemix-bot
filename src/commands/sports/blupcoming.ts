import { CommandContext } from '../types';
import sportsService from '../../services/SportsService';

export default {
  name: 'blupcoming',
  alias: ['bl-upcoming'],
  category: 'sports',
  description: 'Get Bundesliga upcoming matches',
  usage: 'blupcoming',
  permission: 0,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const data = await sportsService.getLeagueData('BL', 'upcoming');
    await ctx.reply(data);
  },
};
