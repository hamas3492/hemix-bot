import { CommandContext } from '../types';
import { EphotoService } from '../../services/EphotoService';

export default {
  name: 'advancedglow',
  alias: [],
  category: 'EPHOTO',
  description: 'Advanced glow text effect',
  usage: '.advancedglow <text>',
  permission: 1,
  cooldown: 10,
  handler: async (ctx: CommandContext) => {
    if (!ctx.text) { await ctx.reply('📝 Please provide text!'); return; }
    await ctx.reply('🎨 Generating image...');
    try {
      const buf = await EphotoService.generateEffect('advancedglow', ctx.text);
      if (buf) {
        await ctx.client.sendMessage(ctx.jid, { image: buf, caption: `🎨 ${ctx.text}` });
      } else {
        await ctx.reply(`🎨 *Advanced glow text effect*\n\nText: ${ctx.text}\n\n⚠️ Image generation service unavailable.`);
      }
    } catch (err: any) { await ctx.reply(`❌ Error: ${err.message}`); }
  },
};
