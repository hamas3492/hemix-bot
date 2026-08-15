import { CommandContext } from '../types';
import axios from 'axios';

export default {
  name: 'trackip',
  alias: ['ipinfo', 'iptrack', 'iplookup'],
  category: 'tools',
  description: 'Track IP address information and geolocation',
  usage: 'trackip <IP address>',
  permission: 0,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const ip = ctx.args[0] || ctx.text;
    if (!ip) {
      return await ctx.reply('⚠️ Please provide an IP address to track (e.g. `trackip 8.8.8.8`)');
    }

    try {
      const res = await axios.get(`http://ip-api.com/json/${ip}`, { timeout: 6000 });
      const d = res.data;

      if (d.status === 'fail') {
        return await ctx.reply(`❌ Invalid IP address or tracking failed: ${d.message}`);
      }

      const info = `🌐 *IP LOCATION & GEOLOCATION*

🌐 *IP:* \`${d.query}\`
🏳️ *Country:* ${d.country} (${d.countryCode})
🏙️ *City / Region:* ${d.city}, ${d.regionName}
📮 *Zip Code:* ${d.zip}
📍 *Lat / Lon:* ${d.lat}, ${d.lon}
🏢 *ISP / Org:* ${d.isp} / ${d.org}
⏰ *Timezone:* ${d.timezone}`;

      await ctx.reply(info);
    } catch (err) {
      await ctx.reply(`❌ IP tracking failed: ${(err as Error).message}`);
    }
  },
};
