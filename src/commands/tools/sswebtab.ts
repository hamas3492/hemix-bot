import { CommandContext } from '../types';
import axios from 'axios';

export default {
  name: 'sswebtab',
  alias: ['sstab', 'screenshottablet'],
  category: 'tools',
  description: 'Take website screenshot in Tablet resolution',
  usage: 'sswebtab <URL>',
  permission: 0,
  cooldown: 5,
  handler: async (ctx: CommandContext) => {
    let url = ctx.args[0] || ctx.text;
    if (!url) {
      return await ctx.reply('⚠️ Usage: `sswebtab https://example.com`');
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    await ctx.reply(`📱 *Taking Tablet view screenshot for:* ${url}`);

    try {
      const ssUrl = `https://image.thum.io/get/width/1024/crop/768/${url}`;
      const res = await axios.get(ssUrl, { responseType: 'arraybuffer', timeout: 12000 });
      const buf = Buffer.from(res.data);

      if (ctx.replyMedia) {
        await ctx.replyMedia(buf, 'image/png', `📱 Tablet View Screenshot: ${url}`);
      } else {
        await ctx.client.sendMessage(ctx.jid, { image: buf, caption: `📱 Tablet View Screenshot: ${url}` }, { quoted: ctx.message });
      }
    } catch (err) {
      await ctx.reply(`❌ Failed to capture tablet screenshot: ${(err as Error).message}`);
    }
  },
};
