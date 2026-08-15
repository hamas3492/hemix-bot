import { Command } from '../../types/command';
import { getTargetName, fetchBuffer } from '../../utils/media';
import axios from 'axios';

const command: Command = {
  name: 'cuddle',
  alias: ['cuddles'],
  category: 'Fun',
  description: 'Send a cuddle reaction gif or message',
  usage: '.cuddle [mention/name]',
  permission: 1,
  cooldown: 3,
  handler: async (ctx) => {
    const sender = ctx.senderName || 'Someone';
    const target = getTargetName(ctx);

    let imageUrl = '';
    try {
      const res = await axios.get('https://api.waifu.pics/sfw/cuddle', { timeout: 5000 });
      if (res.data?.url) {
        imageUrl = res.data.url;
      }
    } catch (e) {
      // try nekos.best fallback
      try {
        const res2 = await axios.get('https://nekos.best/api/v2/cuddle', { timeout: 5000 });
        if (res2.data?.results?.[0]?.url) {
          imageUrl = res2.data.results[0].url;
        }
      } catch (err) {
        // ignore
      }
    }

    const caption = `🤗 *${sender}* tightly cuddles *${target}*! So warm and cozy~ 🥰`;

    if (imageUrl && ctx.replyMedia) {
      const imgBuf = await fetchBuffer(imageUrl);
      if (imgBuf) {
        await ctx.replyMedia(imgBuf, 'image/gif', caption);
        return;
      }
    }

    await ctx.reply(caption);
  },
};

export default command;
