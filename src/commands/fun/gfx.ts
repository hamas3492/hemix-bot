import { Command } from '../../types/command';

const FONT_MAPS: Record<string, (str: string) => string> = {
  bold: (str) => {
    return str.replace(/[A-Za-z0-9]/g, (c) => {
      const code = c.charCodeAt(0);
      if (code >= 65 && code <= 90) return String.fromCodePoint(0x1d400 + code - 65);
      if (code >= 97 && code <= 122) return String.fromCodePoint(0x1d41a + code - 97);
      if (code >= 48 && code <= 57) return String.fromCodePoint(0x1d7ce + code - 48);
      return c;
    });
  },
  monospace: (str) => {
    return str.replace(/[A-Za-z0-9]/g, (c) => {
      const code = c.charCodeAt(0);
      if (code >= 65 && code <= 90) return String.fromCodePoint(0x1d670 + code - 65);
      if (code >= 97 && code <= 122) return String.fromCodePoint(0x1d68a + code - 97);
      if (code >= 48 && code <= 57) return String.fromCodePoint(0x1d7f6 + code - 48);
      return c;
    });
  },
  script: (str) => {
    return str.replace(/[A-Za-z]/g, (c) => {
      const code = c.charCodeAt(0);
      if (code >= 65 && code <= 90) return String.fromCodePoint(0x1d4d0 + code - 65);
      if (code >= 97 && code <= 122) return String.fromCodePoint(0x1d4ea + code - 97);
      return c;
    });
  },
  gothic: (str) => {
    return str.replace(/[A-Za-z]/g, (c) => {
      const code = c.charCodeAt(0);
      if (code >= 65 && code <= 90) return String.fromCodePoint(0x1d504 + code - 65);
      if (code >= 97 && code <= 122) return String.fromCodePoint(0x1d51e + code - 97);
      return c;
    });
  },
  bubbles: (str) => {
    return str.replace(/[A-Za-z0-9]/g, (c) => {
      const code = c.charCodeAt(0);
      if (code >= 65 && code <= 90) return String.fromCodePoint(0x24b6 + code - 65);
      if (code >= 97 && code <= 122) return String.fromCodePoint(0x24d0 + code - 97);
      if (code >= 49 && code <= 57) return String.fromCodePoint(0x2460 + code - 49);
      if (code === 48) return '⓪';
      return c;
    });
  }
};

const command: Command = {
  name: 'gfx',
  alias: ['textgfx', 'fancytext'],
  category: 'Fun',
  description: 'Generate stylized GFX text art styles',
  usage: '.gfx <text>',
  permission: 1,
  cooldown: 2,
  handler: async (ctx) => {
    const text = ctx.text.trim();
    if (!text) {
      await ctx.reply('⚠️ Please enter text to transform into GFX styles! Example: `.gfx Hemix Bot`');
      return;
    }

    const boldText = FONT_MAPS.bold(text);
    const monoText = FONT_MAPS.monospace(text);
    const scriptText = FONT_MAPS.script(text);
    const gothicText = FONT_MAPS.gothic(text);
    const bubbleText = FONT_MAPS.bubbles(text);

    const response =
      `🎨 *GFX STYLED TEXT ART* 🎨\n\n` +
      `1️⃣ *Bold Math:* ${boldText}\n\n` +
      `2️⃣ *Monospace Code:* ${monoText}\n\n` +
      `3️⃣ *Cursive Script:* ${scriptText}\n\n` +
      `4️⃣ *Gothic Dark:* ${gothicText}\n\n` +
      `5️⃣ *Bubble Circles:* ${bubbleText}`;

    await ctx.reply(response);
  },
};

export default command;
