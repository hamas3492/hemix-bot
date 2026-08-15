import { CommandContext } from '../types';
import axios from 'axios';

export default {
  name: 'sswebpc',
  alias: ['sspc', 'screenshotpc'],
  category: 'tools',
  description: 'Take website screenshot in PC Desktop resolution',
  usage: 'sswebpc <URL>',
  permission: 0,
  cooldown: 5,
  handler: async (ctx: CommandContext) => {
    let url = ctx.args[0] || ctx.text;
    if (!url) {
      return await ctx.reply('⚠️ Usage: `sswebpc https://example.com`');
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    await ctx.reply(`🖥️ *Taking Desktop PC screenshot for:* ${url}`);

    try {
      const ssUrl = `https://image.thum.io/get/width/1920/crop/1080/${url}`;
      const res = await axios.get(ssUrl, { responseType: 'arraybuffer', timeout: 12000 });
      const buf = Buffer.from(res.data);

      if (ctx.replyMedia) {
        await ctx.replyMedia(buf, 'image/png', `🖥️ Desktop PC Screenshot: ${url}`);
      } else {
        await ctx.client.sendMessage(ctx.jid, { image: buf, caption: `🖥️ Desktop PC Screenshot: ${url}` }, { quoted: ctx.message });
      }
    } catch (err) {
      await ctx.reply(`❌ Failed to capture PC screenshot: ${(err as Error).message}`);
    }
  },
};
