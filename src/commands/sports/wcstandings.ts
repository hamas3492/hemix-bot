import { CommandContext } from '../types';
import sportsService from '../../services/SportsService';

export default {
  name: 'wcstandings',
  alias: ['wc-standings'],
  category: 'sports',
  description: 'Get World Cup standings',
  usage: 'wcstandings',
  permission: 0,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const data = await sportsService.getLeagueData('WC', 'standings');
    await ctx.reply(data);
  },
};
