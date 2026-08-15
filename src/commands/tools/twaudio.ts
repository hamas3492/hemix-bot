import { CommandContext } from '../types';

export default {
  name: 'twaudio',
  alias: ['twitteraudio', 'twaudiodl'],
  category: 'tools',
  description: 'Extract and download audio from Twitter / X tweet link',
  usage: 'twaudio <Twitter URL>',
  permission: 0,
  cooldown: 4,
  handler: async (ctx: CommandContext) => {
    const url = ctx.args[0] || ctx.text;
    if (!url || (!url.includes('twitter.com') && !url.includes('x.com'))) {
      return await ctx.reply('⚠️ Please provide a valid Twitter/X video link.');
    }

    await ctx.reply('🎵 *Extracting audio from Twitter link...*');
  },
};
