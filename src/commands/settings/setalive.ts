import { CommandContext } from '../types'; import { db } from '../../database';
export default {
  name: 'setalive', alias: ['alive_msg'], category: 'Settings', description: 'Set alive message', usage: '.setalive <text>', permission: 4, cooldown: 3,
  handler: async (ctx: CommandContext) => { if (!ctx.text) { await ctx.reply('Usage: .setalive <text>'); return; }
    db.setSetting('alive_message', ctx.text); await ctx.reply('✅ Alive message updated!'); },
};
