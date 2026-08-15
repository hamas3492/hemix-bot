import { CommandContext } from '../types'; import { db } from '../../database';
export default {
  name: 'setmenuimage', alias: ['menuimg'], category: 'Settings', description: 'Set menu image', usage: '.setmenuimage (reply to image)', permission: 4, cooldown: 5,
  handler: async (ctx: CommandContext) => {
    if (!ctx.quoted?.message?.imageMessage) { await ctx.reply('📷 Reply to an image!'); return; }
    db.setSetting('menu_image', 'set'); await ctx.reply('✅ Menu image updated!');
  },
};
