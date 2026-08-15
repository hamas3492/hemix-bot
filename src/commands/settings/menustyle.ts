import { CommandContext } from '../types';
import { db } from '../../database'; import { config } from '../../config';
export default {
  name: 'menustyle', alias: ['mstyle'], category: 'Settings', description: 'Set menu style', usage: '.menustyle <1-3>', permission: 4, cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const style = ctx.args[0]; if (!style || !['1','2','3'].includes(style)) { await ctx.reply('Usage: .menustyle <1-3>'); return; }
    db.setSetting('menuStyle', style); config.menuStyle = style; await ctx.reply(`✅ Menu style set to ${style}!`);
  },
};
