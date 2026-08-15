import { CommandContext } from '../types';
import sportsService from '../../services/SportsService';

export default {
  name: 'sastandings',
  alias: ['sa-standings'],
  category: 'sports',
  description: 'Get Saudi Arabia standings',
  usage: 'sastandings',
  permission: 0,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const data = await sportsService.getLeagueData('SA', 'standings');
    await ctx.reply(data);
  },
};
