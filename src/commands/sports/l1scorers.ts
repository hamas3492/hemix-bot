import { CommandContext } from '../types';
import sportsService from '../../services/SportsService';

export default {
  name: 'l1scorers',
  alias: ['l1-scorers'],
  category: 'sports',
  description: 'Get Ligue 1 top scorers',
  usage: 'l1scorers',
  permission: 0,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const data = await sportsService.getLeagueData('L1', 'scorers');
    await ctx.reply(data);
  },
};
