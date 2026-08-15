import { CommandContext } from '../types';
import sportsService from '../../services/SportsService';

export default {
  name: 'standings',
  alias: ['table', 'allstandings'],
  category: 'sports',
  description: 'Get standings from major leagues',
  usage: 'standings [epl|ll|bl|cl|sa|l1|efl]',
  permission: 0,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const leagueArg = (ctx.args[0] || 'epl').toUpperCase();
    const codeMap: Record<string, string> = {
      EPL: 'EPL', LL: 'LL', BL: 'BL', CL: 'CL', SA: 'SA', L1: 'L1', EFL: 'EFL', EL: 'EL', WC: 'WC'
    };
    const code = codeMap[leagueArg] || 'EPL';
    const data = await sportsService.getLeagueData(code, 'standings');
    await ctx.reply(data);
  },
};
