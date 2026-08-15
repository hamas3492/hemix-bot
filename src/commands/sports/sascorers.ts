import { CommandContext } from '../types';
import sportsService from '../../services/SportsService';

export default {
  name: 'sascorers',
  alias: ['sa-scorers'],
  category: 'sports',
  description: 'Get Saudi Arabia top scorers',
  usage: 'sascorers',
  permission: 0,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const data = await sportsService.getLeagueData('SA', 'scorers');
    await ctx.reply(data);
  },
};
