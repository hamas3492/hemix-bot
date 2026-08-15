import { CommandContext } from '../types';

export default {
  name: 'remini',
  alias: ['enhance', 'hd'],
  category: 'tools',
  description: 'Image enhancement tool info and upscale guide',
  usage: 'remini (reply to image)',
  permission: 0,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    await ctx.reply(`✨ *IMAGE ENHANCER (REMINI HD)*\n\nSend or reply to an image to enhance resolution, improve sharpness, and restore photo details automatically!`);
  },
};
