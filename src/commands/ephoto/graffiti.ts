import { CommandContext } from '../types';
import { EphotoService } from '../../services/EphotoService';

export default {
  name: 'graffiti',
  alias: [],
  category: 'EPHOTO',
  description: 'Graffiti style text',
  usage: '.graffiti <text>',
  permission: 1,
  cooldown: 10,
  handler: async (ctx: CommandContext) => {
    if (!ctx.text) { await ctx.reply('📝 Please provide text!'); return; }
    await ctx.reply('🎨 Generating image...');
    try {
      const buf = await EphotoService.generateEffect('graffiti', ctx.text);
      if (buf) {
        await ctx.client.sendMessage(ctx.jid, { image: buf, caption: `🎨 ${ctx.text}` });
      } else {
        await ctx.reply(`🎨 *Graffiti style text*\n\nText: ${ctx.text}\n\n⚠️ Image generation service unavailable.`);
      }
    } catch (err: any) { await ctx.reply(`❌ Error: ${err.message}`); }
  },
};
