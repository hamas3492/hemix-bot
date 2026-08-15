import { CommandContext } from '../types';
import axios from 'axios';

export default {
  name: 'say',
  alias: ['tts', 'texttospeech'],
  category: 'tools',
  description: 'Convert text to speech audio message',
  usage: 'say <text>',
  permission: 0,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const text = ctx.text || ctx.args.join(' ');
    if (!text) {
      return await ctx.reply('⚠️ Please provide text to convert to speech.');
    }

    try {
      const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text.slice(0, 200))}&tl=en&client=tw-ob`;
      const res = await axios.get(ttsUrl, { responseType: 'arraybuffer', timeout: 8000 });
      const buf = Buffer.from(res.data);

      await ctx.client.sendMessage(ctx.jid, { audio: buf, mimetype: 'audio/mp4', ptt: true }, { quoted: ctx.message });
    } catch (err) {
      await ctx.reply(`❌ Text-to-speech failed: ${(err as Error).message}`);
    }
  },
};
