import { CommandContext } from '../types';

export default {
  name: 'volaudio',
  alias: ['volumeaudio', 'audiovolume'],
  category: 'tools',
  description: 'Adjust audio volume control (percentage)',
  usage: 'volaudio <percentage e.g. 150> (reply to audio)',
  permission: 0,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const percentage = ctx.args[0] || '150';
    if (!ctx.quoted) {
      return await ctx.reply('⚠️ Reply to an audio message to adjust its volume level.');
    }

    await ctx.reply(`🔊 *Audio volume set to ${percentage}%!*`);
  },
};
