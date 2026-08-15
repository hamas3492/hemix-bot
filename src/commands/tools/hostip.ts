import { CommandContext } from '../types';
import axios from 'axios';

export default {
  name: 'hostip',
  alias: ['serverip', 'myip'],
  category: 'tools',
  description: 'Get host server IP and network information',
  usage: 'hostip',
  permission: 0,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    try {
      const res = await axios.get('http://ip-api.com/json', { timeout: 6000 });
      const d = res.data;

      const info = `🌐 *HOST SERVER IP INFORMATION*

🌐 *IP Address:* \`${d.query}\`
🏳️ *Country:* ${d.country} (${d.countryCode})
🏙️ *City / Region:* ${d.city}, ${d.regionName}
🏢 *ISP:* ${d.isp}
🏢 *Organization:* ${d.org}
⏰ *Timezone:* ${d.timezone}`;

      await ctx.reply(info);
    } catch (err) {
      await ctx.reply(`❌ Failed to fetch host IP info: ${(err as Error).message}`);
    }
  },
};
