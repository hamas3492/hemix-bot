import { CommandContext } from '../types';
import sportsService from '../../services/SportsService';

export default {
  name: 'samatches',
  alias: ['sa-matches'],
  category: 'sports',
  description: 'Get Saudi Arabia matches',
  usage: 'samatches',
  permission: 0,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const data = await sportsService.getLeagueData('SA', 'matches');
    await ctx.reply(data);
  },
};
