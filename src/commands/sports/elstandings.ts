import { CommandContext } from '../types';
import sportsService from '../../services/SportsService';

export default {
  name: 'elstandings',
  alias: ['el-standings'],
  category: 'sports',
  description: 'Get Europa League standings',
  usage: 'elstandings',
  permission: 0,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const data = await sportsService.getLeagueData('EL', 'standings');
    await ctx.reply(data);
  },
};
