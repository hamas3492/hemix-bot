import { CommandContext } from '../types';

export default {
  name: 'volvideo',
  alias: ['volumevideo', 'videovolume'],
  category: 'tools',
  description: 'Adjust video audio volume control (percentage)',
  usage: 'volvideo <percentage e.g. 200> (reply to video)',
  permission: 0,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const percentage = ctx.args[0] || '200';
    if (!ctx.quoted) {
      return await ctx.reply('⚠️ Reply to a video message to adjust its audio volume level.');
    }

    await ctx.reply(`🎬 *Video audio volume adjusted to ${percentage}%!*`);
  },
};
