import { Command } from '../../types/command';

const FLIP_MAP: Record<string, string> = {
  a: 'ɐ', b: 'q', c: 'ɔ', d: 'p', e: 'ǝ', f: 'ɟ', g: 'ƃ', h: 'ɥ', i: 'ı', j: 'ɾ',
  k: 'ʞ', l: 'l', m: 'ɯ', n: 'u', o: 'o', p: 'd', q: 'b', r: 'ɹ', s: 's', t: 'ʇ',
  u: 'n', v: 'ʌ', w: 'ʍ', x: 'x', y: 'ʎ', z: 'z',
  A: '∀', B: 'q', C: 'Ɔ', D: 'p', E: 'Ǝ', F: 'Ⅎ', G: '⅁', H: 'H', I: 'I', J: 'ſ',
  K: 'ʞ', L: '˥', M: 'W', N: 'N', O: 'O', P: 'Ԁ', Q: 'Ò', R: 'ᴚ', S: 'S', T: '┴',
  U: '∩', V: 'Λ', W: 'M', X: 'X', Y: '⅄', Z: 'Z',
  '0': '0', '1': '⇂', '2': 'ᄅ', '3': 'Ɛ', '4': 'ㄣ', '5': 'ϛ', '6': '9', '7': 'ㄥ', '8': '8', '9': '6',
  '.': '˙', ',': "'", "'": ',', '"': '„', '!': '¡', '?': '¿', '(': ')', ')': '(',
  '[': ']', ']': '[', '{': '}', '}': '{', '<': '>', '>': '<', '_': '‾'
};

function flipString(str: string): string {
  return str
    .split('')
    .reverse()
    .map((char) => FLIP_MAP[char] || char)
    .join('');
}

const command: Command = {
  name: 'fliptext',
  alias: ['flip', 'reversetext'],
  category: 'Fun',
  description: 'Flip text upside down',
  usage: '.fliptext <text>',
  permission: 1,
  cooldown: 2,
  handler: async (ctx) => {
    const text = ctx.text.trim();
    if (!text) {
      await ctx.reply('⚠️ Please provide some text to flip! Example: `.fliptext Hello World`');
      return;
    }

    const flipped = flipString(text);
    await ctx.reply(`🙃 *Flipped Text:*\n\n${flipped}`);
  },
};

export default command;
