import { CommandContext } from '../types';
import sportsService from '../../services/SportsService';

export default {
  name: 'blstandings',
  alias: ['bl-standings'],
  category: 'sports',
  description: 'Get Bundesliga standings',
  usage: 'blstandings',
  permission: 0,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const data = await sportsService.getLeagueData('BL', 'standings');
    await ctx.reply(data);
  },
};
