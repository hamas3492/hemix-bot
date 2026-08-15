import { CommandContext } from '../types';

export default {
  name: 'mnm',
  alias: ['mnms'],
  category: 'Fun',
  description: 'M&M style text',
  usage: '.mnm <text>',
  permission: 1,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const text = ctx.text || 'Hemix Bot';
    const styled = text.split('').map((c, i) => {
      const colors = ['🔴', '🟡', '🟢', '🔵', '🟠', '🟣'];
      return `${colors[i % colors.length]}${c}`;
    }).join(' ');
    await ctx.reply(`🍫 M&M Style:\n${styled}`);
  },
};
