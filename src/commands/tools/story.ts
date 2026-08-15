import { CommandContext } from '../types';

export default {
  name: 'story',
  alias: ['whatsappstory'],
  category: 'tools',
  description: 'Download and save status story media',
  usage: 'story (reply to story)',
  permission: 0,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    await ctx.reply('📥 *Story Saver:* Reply to any status or story update to download high-quality media.');
  },
};
