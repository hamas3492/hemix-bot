import { CommandContext } from '../types';
import axios from 'axios';

export default {
  name: 'ssweb',
  alias: ['ss', 'screenshot'],
  category: 'tools',
  description: 'Take website screenshot (standard mode)',
  usage: 'ssweb <URL>',
  permission: 0,
  cooldown: 5,
  handler: async (ctx: CommandContext) => {
    let url = ctx.args[0] || ctx.text;
    if (!url) {
      return await ctx.reply('⚠️ Usage: `ssweb https://example.com`');
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    await ctx.reply(`📸 *Taking website screenshot for:* ${url}`);

    try {
      const ssUrl = `https://image.thum.io/get/width/1200/crop/800/${url}`;
      const res = await axios.get(ssUrl, { responseType: 'arraybuffer', timeout: 12000 });
      const buf = Buffer.from(res.data);

      if (ctx.replyMedia) {
        await ctx.replyMedia(buf, 'image/png', `📸 Screenshot: ${url}`);
      } else {
        await ctx.client.sendMessage(ctx.jid, { image: buf, caption: `📸 Screenshot: ${url}` }, { quoted: ctx.message });
      }
    } catch (err) {
      await ctx.reply(`❌ Failed to take screenshot: ${(err as Error).message}`);
    }
  },
};
