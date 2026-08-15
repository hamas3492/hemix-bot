import { CommandContext } from '../types';

export default {
  name: 'wave',
  alias: ['wavetext'],
  category: 'Fun',
  description: 'Wave text animation',
  usage: '.wave <text>',
  permission: 1,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const text = (ctx.text || 'Hemix').toUpperCase();
    const wave = text.split('').map((c, i) => {
      if (c === ' ') return ' ';
      const emojis = ['👋', '🌊'];
      return i % 2 === 0 ? `${c}` : `${c}`;
    }).join('');
    await ctx.reply(`🌊 Wave:\n\n${wave}\n🌊👋🌊`);
  },
};
