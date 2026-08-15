import { CommandContext } from '../types';

export default {
  name: 'pubg',
  alias: ['playerunknown'],
  category: 'Fun',
  description: 'PUBG themed response',
  usage: '.pubg',
  permission: 1,
  cooldown: 5,
  handler: async (ctx: CommandContext) => {
    await ctx.reply(`🎮 PUBG STATUS:\n\n🔫 Winner Winner Chicken Dinner! 🍗\n📍 ${ctx.senderName} dropped at Pochinki\n💀 Kills: ${Math.floor(Math.random() * 30)}\n🏆 Rank: #${Math.floor(Math.random() * 100) + 1}`);
  },
};
