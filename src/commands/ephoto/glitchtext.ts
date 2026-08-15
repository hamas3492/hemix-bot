import { CommandContext } from '../types';
import { EphotoService } from '../../services/EphotoService';

export default {
  name: 'glitchtext',
  alias: [],
  category: 'EPHOTO',
  description: 'Glitch text effect',
  usage: '.glitchtext <text>',
  permission: 1,
  cooldown: 10,
  handler: async (ctx: CommandContext) => {
    if (!ctx.text) { await ctx.reply('📝 Please provide text!'); return; }
    await ctx.reply('🎨 Generating image...');
    try {
      const buf = await EphotoService.generateEffect('glitchtext', ctx.text);
      if (buf) {
        await ctx.client.sendMessage(ctx.jid, { image: buf, caption: `🎨 ${ctx.text}` });
      } else {
        await ctx.reply(`🎨 *Glitch text effect*\n\nText: ${ctx.text}\n\n⚠️ Image generation service unavailable.`);
      }
    } catch (err: any) { await ctx.reply(`❌ Error: ${err.message}`); }
  },
};
