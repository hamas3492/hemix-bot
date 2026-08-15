import { CommandContext } from '../types';
import sportsService from '../../services/SportsService';

export default {
  name: 'wweschedule',
  alias: ['wrestlingschedule', 'rawschedule', 'smackdownschedule'],
  category: 'sports',
  description: 'Get WWE weekly show schedule',
  usage: 'wweschedule',
  permission: 0,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const data = await sportsService.getWrestlingData('schedule');
    await ctx.reply(data);
  },
};
