import { CommandContext } from '../types';
import sportsService from '../../services/SportsService';

export default {
  name: 'saupcoming',
  alias: ['sa-upcoming'],
  category: 'sports',
  description: 'Get Saudi Arabia upcoming matches',
  usage: 'saupcoming',
  permission: 0,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const data = await sportsService.getLeagueData('SA', 'upcoming');
    await ctx.reply(data);
  },
};
