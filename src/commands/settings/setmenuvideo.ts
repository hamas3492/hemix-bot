import { CommandContext } from '../types'; import { db } from '../../database';
export default {
  name: 'setmenuvideo', alias: ['menuvid'], category: 'Settings', description: 'Set menu video', usage: '.setmenuvideo (reply to video)', permission: 4, cooldown: 5,
  handler: async (ctx: CommandContext) => {
    if (!ctx.quoted?.message?.videoMessage) { await ctx.reply('🎬 Reply to a video!'); return; }
    db.setSetting('menu_video', 'set'); await ctx.reply('✅ Menu video updated!');
  },
};
