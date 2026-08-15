import { CommandContext } from '../types';

export default {
  name: 'wanted',
  alias: ['wantedposter'],
  category: 'Fun',
  description: 'Wanted poster text',
  usage: '.wanted @user',
  permission: 1,
  cooldown: 5,
  handler: async (ctx: CommandContext) => {
    const target = ctx.args[0] || ctx.senderName;
    const reward = Math.floor(Math.random() * 999999) + 1000;
    await ctx.reply(`🤠 *WANTED: DEAD OR ALIVE*\n\n👤 Name: ${target}\n💰 Reward: $${reward.toLocaleString()}\n🔫 Crimes: Being too awesome\n⚠️ Armed and dangerous!\n\n📞 Call 911 if spotted!`);
  },
};
