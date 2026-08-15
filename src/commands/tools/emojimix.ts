import { CommandContext } from '../types';
import axios from 'axios';

export default {
  name: 'emojimix',
  alias: ['mixemoji', 'emix'],
  category: 'tools',
  description: 'Mix two emojis together using Google Emoji Kitchen',
  usage: 'emojimix <emoji1+emoji2>',
  permission: 0,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const arg = ctx.args.join('');
    const emojis = arg.split('+').map(e => e.trim()).filter(Boolean);

    if (emojis.length < 2) {
      return await ctx.reply('⚠️ Usage: `emojimix 😂+😎` or `emojimix 🔥+🐶`');
    }

    const e1 = emojis[0];
    const e2 = emojis[1];

    try {
      const apiUrl = `https://emojik.vercel.app/s/${encodeURIComponent(e1)}_${encodeURIComponent(e2)}?size=512`;
      const res = await axios.get(apiUrl, { responseType: 'arraybuffer', timeout: 8000 });
      const buf = Buffer.from(res.data);

      if (ctx.replyMedia) {
        await ctx.replyMedia(buf, 'image/png', `✨ Emoji Mix: ${e1} + ${e2}`);
      } else {
        await ctx.client.sendMessage(ctx.jid, { image: buf, caption: `✨ Emoji Mix: ${e1} + ${e2}` }, { quoted: ctx.message });
      }
    } catch (err) {
      await ctx.reply(`❌ Unable to mix emojis ${e1} and ${e2}. Make sure they are valid Unicode emojis!`);
    }
  },
};
