import { CommandContext } from '../types';
import sportsService from '../../services/SportsService';

export default {
  name: 'wrestlingevents',
  alias: ['wweevents', 'pfevents'],
  category: 'sports',
  description: 'Get upcoming wrestling / WWE events',
  usage: 'wrestlingevents',
  permission: 0,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const data = await sportsService.getWrestlingData('events');
    await ctx.reply(data);
  },
};
