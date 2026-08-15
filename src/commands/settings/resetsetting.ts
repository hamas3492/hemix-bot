import { CommandContext } from '../types'; import { db } from '../../database';
export default {
  name: 'resetsetting', alias: ['reset'], category: 'Settings', description: 'Reset settings to default', usage: '.resetsetting', permission: 4, cooldown: 10,
  handler: async (ctx: CommandContext) => { db.query('DELETE FROM settings WHERE key != "dashboard_password"'); await ctx.reply('✅ All settings reset to default!'); },
};
