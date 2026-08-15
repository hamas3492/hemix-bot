import { CommandContext } from '../types';
import axios from 'axios';

export default {
  name: 'translate',
  alias: ['tr', 'trans'],
  category: 'tools',
  description: 'Translate text to target language',
  usage: 'translate <lang> <text or reply>',
  permission: 0,
  cooldown: 2,
  handler: async (ctx: CommandContext) => {
    const targetLang = ctx.args[0] || 'en';
    const bodyText = ctx.args.slice(1).join(' ') || ctx.quoted?.message?.conversation || ctx.quoted?.message?.extendedTextMessage?.text;

    if (!bodyText) {
      return await ctx.reply('⚠️ Usage: `translate es Hello world` or reply to a text message with `translate es`');
    }

    try {
      const trUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(bodyText)}`;
      const res = await axios.get(trUrl, { timeout: 6000 });

      const translatedText = res.data?.[0]?.map((item: any) => item[0]).join('') || 'Translation error';
      const detectedLang = res.data?.[2] || 'auto';

      await ctx.reply(`🌐 *TRANSLATION (${detectedLang.toUpperCase()} ➔ ${targetLang.toUpperCase()})*\n\n${translatedText}`);
    } catch (err) {
      await ctx.reply(`❌ Translation error: ${(err as Error).message}`);
    }
  },
};
