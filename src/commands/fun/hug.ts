import { Command } from '../../types/command';
import { getTargetName, fetchBuffer } from '../../utils/media';
import axios from 'axios';

const command: Command = {
  name: 'hug',
  alias: ['hugs'],
  category: 'Fun',
  description: 'Send a hug reaction gif or message',
  usage: '.hug [mention/name]',
  permission: 1,
  cooldown: 3,
  handler: async (ctx) => {
    const sender = ctx.senderName || 'Someone';
    const target = getTargetName(ctx);

    let imageUrl = '';
    try {
      const res = await axios.get('https://api.waifu.pics/sfw/hug', { timeout: 5000 });
      if (res.data?.url) {
        imageUrl = res.data.url;
      }
    } catch (e) {
      try {
        const res2 = await axios.get('https://nekos.best/api/v2/hug', { timeout: 5000 });
        if (res2.data?.results?.[0]?.url) {
          imageUrl = res2.data.results[0].url;
        }
      } catch (err) {
        // Fallback
      }
    }

    const caption = `🫂 *${sender}* gave *${target}* a big warm hug! ❤️`;

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
