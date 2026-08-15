import { CommandContext } from '../types';
import sportsService from '../../services/SportsService';

export default {
  name: 'wwenews',
  alias: ['wrestlingnews'],
  category: 'sports',
  description: 'Get latest WWE news and headlines',
  usage: 'wwenews',
  permission: 0,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const data = await sportsService.getWrestlingData('news');
    await ctx.reply(data);
  },
};
