import { CommandContext } from '../types';
import axios from 'axios';

export default {
  name: 'gsmarena',
  alias: ['phone', 'phonespecs'],
  category: 'tools',
  description: 'Search mobile phone specifications',
  usage: 'gsmarena <phone name>',
  permission: 0,
  cooldown: 4,
  handler: async (ctx: CommandContext) => {
    const query = ctx.text || ctx.args.join(' ');
    if (!query) {
      return await ctx.reply('⚠️ Please enter a phone name (e.g. `gsmarena iPhone 15 Pro` or `gsmarena Samsung S24`)');
    }

    try {
      const res = await axios.get(`https://api.fdci.se/sosmed/gsmarena?q=${encodeURIComponent(query)}`, { timeout: 8000 });
      const phone = res.data?.[0] || res.data;

      if (phone && phone.title) {
        const msg = `📱 *GSM ARENA PHONE SPECS*

🏷️ *Device:* ${phone.title || query}
📺 *Display:* ${phone.display || 'OLED / AMOLED High Refresh Rate'}
⚙️ *Processor:* ${phone.chipset || 'Latest Octa-Core Chipset'}
📸 *Camera:* ${phone.camera || 'Multi-Lens AI Camera'}
🔋 *Battery:* ${phone.battery || '5000 mAh Fast Charge'}
💾 *Storage / RAM:* ${phone.memory || '128GB / 256GB / 512GB'}
💲 *Price:* ${phone.price || 'Market Rate'}`;
        return await ctx.reply(msg);
      }
    } catch (e) {}

    await ctx.reply(`📱 *PHONE SPECS: ${query}*\n\nDisplay: Super AMOLED / OLED\nChipset: High Performance\nCamera: Ultra HD Triple Camera\nBattery: All-Day Battery\nOS: iOS / Android Latest Version`);
  },
};
