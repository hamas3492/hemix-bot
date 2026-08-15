import { CommandContext } from '../types';

export default {
  name: 'summerbeach',
  alias: ['beach', 'summertext'],
  category: 'tools',
  description: 'Summer beach styled decorated text',
  usage: 'summerbeach <text>',
  permission: 0,
  cooldown: 2,
  handler: async (ctx: CommandContext) => {
    const text = ctx.text || ctx.args.join(' ') || 'Summer Vibes';
    const styled = `🏖️ ☀️ 🌊 *${text.toUpperCase()}* 🌊 ☀️ 🏖️\n\n🌴 🏊‍♂️ ~ ${text} ~ 🍹 🐚`;
    await ctx.reply(styled);
  },
};
