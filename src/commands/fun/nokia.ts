import { CommandContext } from '../types';

export default {
  name: 'nokia',
  alias: ['nokiaringtone'],
  category: 'Fun',
  description: 'Nokia ringtone text',
  usage: '.nokia',
  permission: 1,
  cooldown: 5,
  handler: async (ctx: CommandContext) => {
    await ctx.reply(`📱 Nokia Ringtone:\n\n🎵 Da da da da... 🎵\n🎵 Da da da da... 🎵\n🎵 Nokia connecting people! 🎵\n\n📞 *Brrr brrr...* Someone's calling on a Nokia!`);
  },
};
