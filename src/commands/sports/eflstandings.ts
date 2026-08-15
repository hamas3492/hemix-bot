import { CommandContext } from '../types';
import sportsService from '../../services/SportsService';

export default {
  name: 'eflstandings',
  alias: ['efl-standings'],
  category: 'sports',
  description: 'Get EFL standings',
  usage: 'eflstandings',
  permission: 0,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const data = await sportsService.getLeagueData('EFL', 'standings');
    await ctx.reply(data);
  },
};
